document.addEventListener('DOMContentLoaded', () => {
    const pointsBox = document.getElementById('points');
    const addPointsBtn = document.getElementById('add-points-btn');
    const addPointsModal = document.getElementById('add-points-modal');
    const closeModal = document.querySelector('.close');
    const addPointsForm = document.getElementById('add-points-form');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const userIdInput = document.getElementById('user-id');
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const userIdError = document.getElementById('user-id-error');
    let points = 0;
    let usedUserIds = new Set();

    // استرجاع البيانات من Local Storage إذا كانت موجودة
    const storedPoints = localStorage.getItem('points');
    const storedUserIds = localStorage.getItem('usedUserIds');

    if (storedPoints) {
        points = parseInt(storedPoints);
        pointsBox.textContent = points;
    }

    if (storedUserIds) {
        usedUserIds = new Set(JSON.parse(storedUserIds));
    }

    addPointsBtn.addEventListener('click', () => {
        addPointsModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        addPointsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == addPointsModal) {
            addPointsModal.style.display = 'none';
        }
    });

    addPointsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const userId = userIdInput.value.trim();

        let valid = true;
        let pointsToAdd = 0;

        if (!validateName(name)) {
            nameError.textContent = 'يجب إدخال اسمك ثلاثي';
            valid = false;
        } else {
            nameError.textContent = '';
        }

        if (!validatePhone(phone)) {
            phoneError.textContent = 'رقم الهاتف هذا غير صحيح';
            valid = false;
        } else {
            phoneError.textContent = '';
        }

        const userIdValidationResult = validateUserId(phone, userId);
        if (userIdValidationResult === "invalid") {
            userIdError.textContent = 'هذا اليوزر غير صحيح';
            valid = false;
        } else {
            userIdError.textContent = '';
            pointsToAdd = userIdValidationResult === "first" ? 10 : (userIdValidationResult === "second" ? 100 : (userIdValidationResult === "third" ? 10 : 0));
        }

        if (usedUserIds.has(userId)) {
            alert('هذا اليوزر تم استخدامه بالفعل');
            valid = false;
        }

        if (!valid) {
            return;
        }

        if (userIdValidationResult === "both") {
            let choice = prompt("Both User ID formats are correct. Enter '10' to add 10 points or '100' to add 100 points.");
            if (choice === '10') {
                pointsToAdd = 10;
            } else if (choice === '100') {
                pointsToAdd = 100;
            } else {
                alert('Invalid choice.');
                return;
            }
        }

        // Check if userId already used for login, prevent points addition
        if (usedUserIds.has(userId)) {
            alert('هذا اليوزر تم استخدامه بالفعل');
            return;
        }

        usedUserIds.add(userId);
        localStorage.setItem('usedUserIds', JSON.stringify(Array.from(usedUserIds)));

        points += pointsToAdd;
        pointsBox.textContent = points;
        localStorage.setItem('points', points.toString());
        addPointsModal.style.display = 'none';
        addPointsForm.reset();
    });

    document.querySelectorAll('.withdraw-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            if (points < 10) {
                alert('ليس لديك نقاط');
                return;
            }
            const confirmWithdraw = confirm(`هل انت متأكد من دخول السحب لـ ${event.target.dataset.device}?`);
            if (confirmWithdraw) {
                points -= 10;
                pointsBox.textContent = points;
                localStorage.setItem('points', points.toString());
                alert(`لقد تم دخول السحب بنجاح ${event.target.dataset.device}!`);
            }
        });
    });

    function validateName(name) {
        const syllables = name.split(/\s+/).length;
        return syllables >= 3;
    }

    function validatePhone(phone) {
        return /^(010|011|012|015)\d{8}$/.test(phone);
    }

    function generateValidUserIds(phone) {
        const fourthDigit = phone.charAt(3);
        const seventhDigit = phone.charAt(6);
        const fifthDigit = phone.charAt(4);
        const eighthDigit = phone.charAt(7);
        const base1 = 12;
        const base2 = 13;
        const base3 = 14;

        const firstExpectedUserId = `UserID${fourthDigit}${seventhDigit}${Math.pow(base1, parseInt(fifthDigit)) + 931}`;
        const secondExpectedUserId = `UserID${fifthDigit}${eighthDigit}${Math.pow(base2, parseInt(seventhDigit)) + 534}`;
        
        // إضافة اليوزر الثالث
        const thirdExpectedUserId = `UserID${fourthDigit}${seventhDigit}${Math.pow(base3, parseInt(seventhDigit)) + 831}`;
        
        return {
            firstExpectedUserId,
            secondExpectedUserId,
            thirdExpectedUserId,
            additionalUserIds: [], // لا يوجد يوزرات إضافية حاليًا
        };
    }

    function validateUserId(phone, userId) {
        const { firstExpectedUserId, secondExpectedUserId, thirdExpectedUserId } = generateValidUserIds(phone);

        if (userId === firstExpectedUserId) {
            return "first";
        } else if (userId === secondExpectedUserId) {
            return "second";
        } else if (userId === thirdExpectedUserId) {
            return "third"; // يوزر الثالث
        } else {
            return "invalid";
        }
    }
});