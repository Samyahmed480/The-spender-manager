// عناصر النافذة المنبثقة
const editModal = document.getElementById('edit-modal');
const editAmount = document.getElementById('edit-amount');
const editDesc = document.getElementById('edit-desc');
const editAddRadio = document.getElementById('edit-add');
const editSubRadio = document.getElementById('edit-sub');
const editSaveBtn = document.getElementById('edit-save');
const editCancelBtn = document.getElementById('edit-cancel');
let editIndex = null;
// عناصر الصفحة
const amountInput = document.getElementById('amount');
const descInput = document.getElementById('desc');
const addRadio = document.getElementById('p');
const subRadio = document.getElementById('n');
const submitBtn = document.getElementById('submit');
const balanceSpan = document.getElementById('balance');
const recordsBody = document.getElementById('records');
const totalTop = document.getElementById('total-top');
const printBtn = document.getElementById('print');
const deleteAllBtn = document.getElementById('deleteAll');
const totalTable = document.getElementById('total-table');
const searchInput = document.getElementById('search');

// تحميل العمليات من localStorage
function loadRecords() {
    const data = localStorage.getItem('records');
    return data ? JSON.parse(data) : [];
}

// حفظ العمليات في localStorage
function saveRecords(records) {
    localStorage.setItem('records', JSON.stringify(records));
}

// حساب الرصيد الحالي
function calcBalance(records) {
    let balance = 0;
    for (const r of records) {
        balance += r.type === 'add' ? r.amount : -r.amount;
    }
    return balance;
}

// حساب المجموع
// المجموع = مجموع الإضافات - مجموع النواقص
function calcTotal(records) {
    let total = 0;
    for (const r of records) {
        total += r.type === 'add' ? r.amount : -r.amount;
    }
    return total;
}

// عرض العمليات في الجدول مع أزرار حذف وتعديل
function renderRecords(records, filter = '') {
    recordsBody.innerHTML = '';
    let filtered = records;
    if (filter.trim()) {
        filtered = records.filter(r => r.desc.includes(filter.trim()));
    }
    filtered.forEach((r, i) => {
        const tr = document.createElement('tr');
        const color = r.type === 'add' ? 'green' : 'red';
        tr.innerHTML = `
            <td style=\"color:${color};font-weight:bold;\">${r.type === 'add' ? '+' : '-'}${r.amount}</td>
            <td>${r.desc}</td>
            <td>${r.date}</td>
            <td>
                <button class='edit-btn' data-idx='${i}'>تعديل</button>
                <button class='delete-btn' data-idx='${i}' style='background:#ef4444;color:#fff;'>حذف</button>
            </td>
        `;
        recordsBody.appendChild(tr);
    });
    const total = calcTotal(filtered);
    totalTop.textContent = total;
    if (totalTable) totalTable.textContent = total;

    // ربط أحداث الحذف
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = function () {
            const idx = parseInt(btn.getAttribute('data-idx'));
            const allRecords = loadRecords();
            // حذف العملية حسب الفلترة
            const filteredIdx = records.indexOf(filtered[idx]);
            if (filteredIdx > -1) {
                allRecords.splice(filteredIdx, 1);
                saveRecords(allRecords);
                renderRecords(loadRecords(), searchInput.value);
                updateBalance(loadRecords());
            }
        };
    });

    // ربط أحداث التعديل
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = function () {
            const idx = parseInt(btn.getAttribute('data-idx'));
            const r = filtered[idx];
            editIndex = records.indexOf(filtered[idx]);
            // تعبئة بيانات العملية في النافذة المنبثقة
            editAmount.value = r.amount;
            editDesc.value = r.desc;
            if (r.type === 'add') {
                editAddRadio.checked = true;
                editSubRadio.checked = false;
            } else {
                editAddRadio.checked = false;
                editSubRadio.checked = true;
            }
            editModal.style.display = 'flex';
        };
    });

    // حفظ التعديل
    if (editSaveBtn) {
        editSaveBtn.onclick = function () {
            const amount = parseFloat(editAmount.value);
            const desc = editDesc.value.trim();
            const type = editAddRadio.checked ? 'add' : editSubRadio.checked ? 'sub' : null;
            if (!amount || !desc || !type) {
                alert('يرجى إدخال جميع البيانات واختيار نوع العملية');
                return;
            }
            const allRecords = loadRecords();
            if (editIndex !== null && allRecords[editIndex]) {
                allRecords[editIndex] = {
                    amount,
                    desc,
                    type,
                    date: new Date().toLocaleDateString()
                };
                saveRecords(allRecords);
                renderRecords(loadRecords(), searchInput.value);
                updateBalance(loadRecords());
                editModal.style.display = 'none';
                editIndex = null;
            }
        };
    }

    // إلغاء التعديل
    if (editCancelBtn) {
        editCancelBtn.onclick = function () {
            editModal.style.display = 'none';
            editIndex = null;
        };
    }
}

// تحديث الرصيد
function updateBalance(records) {
    balanceSpan.textContent = calcBalance(records);
}
// زر الطباعة
if (printBtn) {
    printBtn.onclick = function () {
        window.print();
    };
}

// زر حذف الكل
if (deleteAllBtn) {
    deleteAllBtn.onclick = function () {
        if (confirm('هل أنت متأكد من حذف جميع العمليات؟')) {
            localStorage.removeItem('records');
            renderRecords([]);
            updateBalance([]);
        }
    };
}

// إضافة عملية جديدة (الوضع الافتراضي)
function defaultAddHandler() {
    const amount = parseFloat(amountInput.value);
    const desc = descInput.value.trim();
    const type = addRadio.checked ? 'add' : subRadio.checked ? 'sub' : null;
    if (!amount || !desc || !type) {
        alert('يرجى إدخال جميع البيانات واختيار نوع العملية');
        return;
    }
    const records = loadRecords();
    records.push({
        amount,
        desc,
        type,
        date: new Date().toLocaleDateString()
    });
    saveRecords(records);
    renderRecords(records, searchInput.value);
    updateBalance(records);
    amountInput.value = '';
    descInput.value = '';
    addRadio.checked = false;
    subRadio.checked = false;
}
submitBtn.onclick = defaultAddHandler;

// البحث
searchInput.oninput = function () {
    const records = loadRecords();
    renderRecords(records, searchInput.value);
};

// تحميل البيانات عند بدء الصفحة
window.onload = function () {
    const records = loadRecords();
    renderRecords(records);
    updateBalance(records);
};
