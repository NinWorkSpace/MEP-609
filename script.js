// ==========================================
// 1. ระบบจัดการสลับหน้าย่อย (Single Page App)
// ==========================================
const menuLinks = document.querySelectorAll('.menu-link');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('current-page-title');
const pageDesc = document.getElementById('current-page-desc');

const pageMeta = {
    dashboard: { title: "Dashboard", desc: "ยินดีต้อนรับสู่ระบบจัดการห้องเรียน MEP 6/9" },
    homework: { title: "การบ้าน", desc: "ติดตามงานค้างและรายการส่งการบ้านล่าสุด" },
    announcement: { title: "ประกาศ/กิจกรรม", desc: "ข่าวสารสำคัญและกิจกรรมจากห้องเรียน" },
    schedule: { title: "ตารางเรียน", desc: "ตารางสอนประจำภาคเรียนของห้องเรา" },
    exam: { title: "ตารางสอบ", desc: "ตารางสอบและกิจกรรมวัดผลที่กำลังจะมาถึง" },
    finance: { title: "การเงินห้อง", desc: "สรุปรายรับ-รายจ่ายและเงินกองกลาง" },
    gallery: { title: "คลังรูปกิจกรรม", desc: "ภาพความทรงจำและกิจกรรมต่างๆ ของห้อง 6/9" },
    members: { title: "สมาชิกห้อง", desc: "รายชื่อเพื่อนๆ และคณะกรรมการห้องเรียน" }
};

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        menuLinks.forEach(item => item.classList.remove('active'));
        pageSections.forEach(section => section.classList.remove('active'));
        
        link.classList.add('active');
        const targetPage = link.getAttribute('data-target');
        
        document.getElementById(`page-${targetPage}`).classList.add('active');
        pageTitle.innerText = pageMeta[targetPage].title;
        pageDesc.innerText = pageMeta[targetPage].desc;

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            mobileToggle.querySelector('i').className = 'fas fa-bars';
        }
    });
});

// ==========================================
// 2. ระบบ AUTO DARK MODE ตามเวลาประเทศไทย
// ==========================================
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = themeToggleBtn.querySelector('i');
const themeText = themeToggleBtn.querySelector('span');

function applyAutoTheme() {
    const options = { timeZone: 'Asia/Bangkok', hour: '2-digit', hour12: false };
    const thailandHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    const isDayTime = thailandHour >= 6 && thailandHour < 18;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);
    } else {
        const targetTheme = isDayTime ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', targetTheme);
        updateThemeUI(targetTheme, true); 
    }
}

themeToggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); 
    updateThemeUI(newTheme);
});

function updateThemeUI(theme, isAuto = false) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeText.innerText = isAuto ? 'โหมดมืด (ออโต้ไทย)' : 'โหมดสว่าง';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.innerText = isAuto ? 'โหมดสว่าง (ออโต้ไทย)' : 'โหมดมืด';
    }
}
applyAutoTheme();

// 3. เปิด/ปิด Sidebar บนมือถือ
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    icon.className = sidebar.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
});

// ==========================================
// 🛠️ 4. ระบบจำลองหลังบ้าน (BACKEND OPERATIONS)
// ==========================================

let database = {
    homeworks: JSON.parse(localStorage.getItem('db_homeworks')) || [],
    announcements: JSON.parse(localStorage.getItem('db_announcements')) || [],
    finance: JSON.parse(localStorage.getItem('db_finance')) || [],
    gallery: JSON.parse(localStorage.getItem('db_gallery')) || [],
    exams: JSON.parse(localStorage.getItem('db_exams')) || [] // เพิ่มหน่วยความจำรองรับตารางสอบหลังบ้าน
};

function syncBackend() {
    localStorage.setItem('db_homeworks', JSON.stringify(database.homeworks));
    localStorage.setItem('db_announcements', JSON.stringify(database.announcements));
    localStorage.setItem('db_finance', JSON.stringify(database.finance));
    localStorage.setItem('db_gallery', JSON.stringify(database.gallery));
    localStorage.setItem('db_exams', JSON.stringify(database.exams)); // บันทึกข้อมูลตารางสอบลง LocalStorage
    renderAll();
}

// --- ฟังก์ชันดึงและเรนเดอร์ข้อมูลขึ้น UI หน้าเว็บ ---
function renderAll() {
    // 4.1 เรนเดอร์หน้ารายการการบ้าน
    const hwListContainer = document.getElementById('homework-list-container');
    const dashHw = document.getElementById('dashboard-homeworks');
    
    if (database.homeworks.length === 0) {
        if(hwListContainer) hwListContainer.innerHTML = `<div class="empty-state"><p>ไม่มีการบ้านค้างส่ง</p></div>`;
        if(dashHw) dashHw.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle" style="color:var(--accent-color);"></i><p>เย้! ทำงานครบหมดแล้ว</p></div>`;
    } else {
        let hwHtml = '';
        database.homeworks.forEach((item, index) => {
            hwHtml += `
                <div class="homework-item">
                    <div class="hw-info">
                        <span class="badge badge-mint">งานห้อง</span>
                        <h4>${item.subject}</h4>
                        <p>${item.detail}</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div class="hw-date">📅 ส่ง: ${item.date}</div>
                        <button class="delete-btn admin-only" onclick="deleteItem('homeworks', ${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        });
        if(hwListContainer) hwListContainer.innerHTML = hwHtml;
        if(dashHw) dashHw.innerHTML = hwHtml;
    }

    // 4.2 เรนเดอร์หน้าประกาศ / กิจกรรม
    const annContainer = document.getElementById('announcement-list-container');
    const dashAnn = document.getElementById('dashboard-announcements');
    
    if (database.announcements.length === 0) {
        if(annContainer) annContainer.innerHTML = `<div class="empty-state"><p>ยังไม่มีประกาศแจ้งกิจกรรม</p></div>`;
        if(dashAnn) dashAnn.innerHTML = `<div class="empty-state"><i class="fas fa-bell-slash"></i><p>ยังไม่มีประกาศใหม่ในขณะนี้</p></div>`;
    } else {
        let annHtml = '';
        database.announcements.forEach((item, index) => {
            annHtml += `
                <div class="card glass-card post-card">
                    <div class="post-header">
                        <div class="avatar" style="display:flex;align-items:center;justify-content:center;color:white;"><i class="fas fa-bullhorn"></i></div>
                        <div style="flex-grow:1;">
                            <h4>ฝ่ายบริหารจัดการห้องเรียน MEP</h4>
                            <span class="post-time">อัปเดตระบบแล้ว</span>
                        </div>
                        <button class="delete-btn admin-only" onclick="deleteItem('announcements', ${index})"><i class="fas fa-trash"></i></button>
                    </div>
                    <div class="post-content"><p>${item.content}</p></div>
                </div>`;
        });
        if(annContainer) annContainer.innerHTML = annHtml;
        if(dashAnn) dashAnn.innerHTML = annHtml;
    }

    // ตรวจสอบสิทธิ์เฉพาะสำหรับการเงินห้อง (อนุญาตเฉพาะ Role: Developer และ Accountant ตามที่ HTML ตั้งไว้)
    const loggedInUser = sessionStorage.getItem('username');
    const isFinanceAdmin = loggedInUser && allowedUsers[loggedInUser] && 
                          (allowedUsers[loggedInUser].role === 'Developer' || allowedUsers[loggedInUser].role === 'Accountant');
    
    // 4.3 เรนเดอร์ระบบบัญชีและการเงินห้อง
    const financeTable = document.getElementById('finance-table-body');
    let totalBalance = 0;
    let financeHtml = '';
    database.finance.forEach((item, index) => {
        const isIncome = item.type === 'income';
        totalBalance += isIncome ? item.amount : -item.amount;
        financeHtml += `
            <tr class="${isIncome ? 'income' : 'expense'}">
                <td>${item.title}</td>
                <td>${isIncome ? 'รายรับ' : 'รายจ่าย'}</td>
                <td>${isIncome ? '+' : '-'}${item.amount.toFixed(2)} ฿</td>
                <td><button class="delete-btn" style="display: ${isFinanceAdmin ? 'inline-block' : 'none'}" onclick="deleteItem('finance', ${index})"><i class="fas fa-trash"></i></button></td>
            </tr>`;
    });
    if (financeTable) {
        financeTable.innerHTML = financeHtml || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">ยังไม่มีประวัติการเงิน</td></tr>';
    }
    
    const dashBalanceEl = document.getElementById('dashboard-balance');
    const finBalanceEl = document.getElementById('finance-total-balance');
    if(dashBalanceEl) dashBalanceEl.innerText = `${totalBalance.toLocaleString()}.00 ฿`;
    if(finBalanceEl) finBalanceEl.innerText = `${totalBalance.toLocaleString()}.00 ฿`;
    
    // ซ่อนหรือแสดงฟอร์มบันทึกรายรับ-รายจ่ายห้องตามสิทธิ์ (Developer / Accountant เท่านั้น)
    const financeAdminBlock = document.querySelector('#page-finance .admin-only');
    if (financeAdminBlock) {
        if (isFinanceAdmin) {
            financeAdminBlock.style.setProperty('display', 'block', 'important');
        } else {
            financeAdminBlock.style.setProperty('display', 'none', 'important');
        }
    }

    // 4.4 คลังรูปภาพกิจกรรม
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
        if (database.gallery.length === 0) {
            galleryContainer.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>ยังไม่มีรูปภาพกิจกรรม</p></div>`;
        } else {
            let galHtml = '';
            database.gallery.forEach((item, index) => {
                galHtml += `
                    <div class="gallery-item">
                        <div class="gallery-img-wrapper">
                            <img src="${item.url}" alt="${item.title}" style="width:100%; height:180px; object-fit:cover;">
                        </div>
                        <div class="gallery-info" style="display:flex; justify-content:between; align-items:center; padding:10px 0;">
                            <h4 style="flex-grow:1;">${item.title}</h4>
                            <button class="delete-btn admin-only" onclick="deleteItem('gallery', ${index})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
            });
            galleryContainer.innerHTML = galHtml;
        }
    }

    // 4.5 เรนเดอร์หน้าตารางสอบพร้อมรูปกิจกรรม (ย้ายเข้ามาอยู่ในฟังก์ชันเรนเดอร์หลักสัมพันธ์กับการซิงค์ข้อมูล)
    const examTable = document.getElementById('exam-table-body');
    if (examTable) {
        if (database.exams.length === 0) {
            examTable.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">ยังไม่มีรายการกำหนดการสอบ</td></tr>`;
        } else {
            let examHtml = '';
            database.exams.forEach((item, index) => {
                const formattedDate = new Date(item.date).toLocaleDateString('th-TH', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
                
                const imgCell = item.img ? 
                    `<a href="${item.img}" target="_blank"><img src="${item.img}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid var(--border-color);" title="คลิกเพื่อดูรูปใหญ่"></a>` : 
                    `<span style="color:var(--text-muted); font-size:12px;">ไม่มีรูปกิจกรรม</span>`;

                examHtml += `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${item.time}</td>
                        <td><strong>${item.subject}</strong></td>
                        <td>${item.room}</td>
                        <td>${imgCell}</td>
                        <td class="admin-control">
                            <button class="delete-btn" onclick="deleteItem('exams', ${index})"><i class="fas fa-trash"></i> ลบ</button>
                        </td>
                    </tr>`;
            });
            examTable.innerHTML = examHtml;
        }
    }
}

// ฟังก์ชันสั่งลบข้อมูลออกจากฐานข้อมูลหลังบ้าน
window.deleteItem = function(category, index) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการข้อมูลนี้ออกจากระบบถาวร?")) {
        database[category].splice(index, 1);
        syncBackend();
    }
};

// --- ดักจับฟอร์มเพิ่มข้อมูลส่งไปหลังบ้าน ---
document.getElementById('add-homework-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    database.homeworks.push({
        subject: document.getElementById('hw-subject').value,
        detail: document.getElementById('hw-detail').value,
        date: document.getElementById('hw-date').value
    });
    e.target.reset();
    syncBackend();
});

document.getElementById('add-announcement-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    database.announcements.unshift({ content: document.getElementById('ann-content').value });
    e.target.reset();
    syncBackend();
});

document.getElementById('add-gallery-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    database.gallery.push({
        title: document.getElementById('gal-title').value,
        url: document.getElementById('gal-url').value
    });
    e.target.reset();
    syncBackend();
});

// ดักจับฟอร์มบันทึกข้อมูลตารางสอบส่งไปหลังบ้าน (ใส่ ?. เผื่อในหน้า HTML ไม่พบบทบาทของฟอร์มนี้)
document.getElementById('add-exam-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    database.exams.push({
        date: document.getElementById('exam-date').value,
        time: document.getElementById('exam-time').value,
        subject: document.getElementById('exam-subject').value,
        room: document.getElementById('exam-room').value,
        img: document.getElementById('exam-img').value
    });
    e.target.reset();
    syncBackend();
});

// ดักจับฝั่งฟอร์มการเงิน (รายรับ / รายจ่าย)
document.getElementById('btn-income')?.addEventListener('click', () => handleFinance('income'));
document.getElementById('btn-expense')?.addEventListener('click', () => handleFinance('expense'));

function handleFinance(type) {
    const title = document.getElementById('fin-title').value;
    const amount = parseFloat(document.getElementById('fin-amount').value);
    if(!title || isNaN(amount)) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    database.finance.push({ title, amount, type });
    document.getElementById('finance-form').reset();
    syncBackend();
}

// ==========================================
// 🔐 5. ระบบเข้าสู่ระบบสิทธิ์แอดมินตามเลขที่และตำแหน่งใน HTML (Login System)
// ==========================================
const loginModal = document.getElementById('loginModal');
const openLoginBtn = document.getElementById('openLoginBtn');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const loginForm = document.getElementById('loginForm');
const userProfileArea = document.getElementById('userProfileArea');

// ฐานข้อมูลผู้ใช้: ใช้รหัสประจำตัว 5 ตัวแรกเป็น Username คีย์หลัก และเชื่อมตำแหน่ง Role ตรงกับหน้า HTML
const allowedUsers = {
    "14799": { password: "11/04/2552", no: 1, name: "นายนิลพัทธ์ เวียงนนท์", role: "Developer" },
    "14806": { password: "25/03/2552", no: 2, name: "นายปุญชรัศม์ ผลทรัพย์เจริญ", role: "member" },
    "14880": { password: "25/05/2552", no: 3, name: "เด็กชายอติชาต นวลสุวรรณ", role: "Class Leader" },
    "16535": { password: "12/10/2551", no: 4, name: "นายโยชูวา มิ่งมาศ", role: "member" },
    "14901": { password: "04/11/2551", no: 5, name: "นางสาวกนกณัฐ ปัญญาทิพย์", role: "Co-leader" },
    "14910": { password: "07/09/2551", no: 6, name: "นางสาวกัญญาภัทร บุญดาษา", role: "member" },
    "14933": { password: "21/11/2551", no: 7, name: "นางสาวชญานิน เขียวเขิน", role: "member" },
    "14954": { password: "10/08/2551", no: 8, name: "นางสาวณิชาภัทร ชมภูแสง", role: "member" },
    "14956": { password: "24/08/2551", no: 9, name: "นางสาวณิชาภัทร อะปะมาตร์", role: "member" },
    "15062": { password: "02/11/2551", no: 10, name: "นางสาวสีตรา ศรีสวัสดิ์", role: "member" },
    "15073": { password: "18/06/2552", no: 11, name: "นางสาวอภิสรา รมยสมิทธิ", role: "member" },
    "16574": { password: "09/11/2551", no: 12, name: "นางสาวแพรวแพรวา อาจวิชัย", role: "Accountant" }
};

const checkUserSession = () => {
    const loggedInUser = sessionStorage.getItem('username');
    if (loggedInUser && allowedUsers[loggedInUser]) {
        const user = allowedUsers[loggedInUser];
        // เมื่อเข้าสู่ระบบ จะเปิดบอดี้เป็นโหมด admin เพื่อปลดล็อกปุ่มเพิ่ม/ลบสำหรับการบ้าน ประกาศ และคลังรูปภาพ
        document.body.classList.add('admin-mode');
        // แสดงชื่อจริงและบทบาทที่ผูกไว้ตรงตามโครงสร้างของระบบเว็บ
        userProfileArea.innerHTML = `
            <span class="user-status online" style="background:#e8f5e9;color:#2e7d32;font-weight:600;padding:5px 10px;border-radius:20px;">⚡ ${user.role}: ${user.name}</span>
            <button class="logout-btn" id="logoutBtn" style="margin-left:10px;"><i class="fas fa-sign-out-alt"></i> ออกจากระบบ</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('username');
            document.body.classList.remove('admin-mode');
            location.reload();
        });
    }
    renderAll(); // โหลดและประมวลผลการแสดงผลหน้า UI แยกสิทธิ์ตามผู้ใช้ที่ใช้งานจริง
};

if (openLoginBtn) { openLoginBtn.addEventListener('click', () => loginModal.classList.add('open')); }
if (closeLoginBtn) { closeLoginBtn.addEventListener('click', () => loginModal.classList.remove('open')); }
window.addEventListener('click', (e) => { if (e.target === loginModal) loginModal.classList.remove('open'); });

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputUser = document.getElementById('username').value.trim();
    const inputPass = document.getElementById('password').value.trim();
    
    // ตรวจสอบข้อมูลรหัสประจำตัว 5 ตัวแรก และตรวจสอบรหัสผ่านวันเกิดรูปแบบ (วัน/เดือน/ปีพ.ศ.)
    if (allowedUsers[inputUser] && allowedUsers[inputUser].password === inputPass) {
        sessionStorage.setItem('username', inputUser);
        loginModal.classList.remove('open');
        checkUserSession();
    } else {
        // หากกรอกไม่ตรงตามเงื่อนไข จะทำการเเจ้งเตือนเออเร่อ
        alert("ชื่อหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง");
    }
});

// เริ่มต้นตรวจสอบสถานะเซสชันการเข้าสู่ระบบทันทีที่โหลดหน้าเว็บเสร็จสิ้น
checkUserSession();