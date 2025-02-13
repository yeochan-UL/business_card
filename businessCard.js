document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = function(e) {
        const imgElement = document.getElementById('preview');
        imgElement.src = e.target.result;
        imgElement.style.display = 'block';
        
        // OCR 수행
        recognizeText(e.target.result);
    };
    reader.readAsDataURL(file);
});

function recognizeText(imageData) {
    Tesseract.recognize(
        imageData, 
        'eng+kor', 
        {
            logger: m => console.log(m) // 진행 상태 표시
        }
    ).then(({ data: { text } }) => {
        console.log("추출된 텍스트:", text);
        
        // 정규식을 사용하여 정보 추출
        extractInfo(text);
    }).catch(error => console.error("OCR 오류:", error));
}

function extractInfo(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /\d{2,3}-\d{3,4}-\d{4}/;
    const companyRegex = /(㈜|주식회사)?\s*[A-Za-z가-힣\s]+/;

    const email = text.match(emailRegex)?.[0] || '이메일 없음';
    const phone = text.match(phoneRegex)?.[0] || '전화번호 없음';
    const company = text.match(companyRegex)?.[0] || '회사명 없음';

    // 결과 출력
    document.getElementById('email').textContent = email;
    document.getElementById('phone').textContent = phone;
    document.getElementById('company').textContent = company;
}
