document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 1) 업로드한 이미지 미리보기
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('preview');
        if (previewImg) {
            previewImg.src = e.target.result;  // base64 데이터
            previewImg.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);

    // 2) 서버로 OCR 요청
    recognizeText(file);
});

async function recognizeText(file) {
    // 실제 서버 엔드포인트 (예: /name-card)
    const url = 'https://ocr-proxy.vercel.app/name-card';

    // multipart/form-data 구성
    const formData = new FormData();
    formData.append('file', file);

    console.log("보낼 FormData:", formData);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log("OCR 결과 전체:", result);

        // 3) 응답 데이터에서 nameCard.result 구조 추출
        if (
            result.images && 
            result.images.length > 0 &&
            result.images[0].nameCard &&
            result.images[0].nameCard.result
        ) {
            const nameCard = result.images[0].nameCard.result;
            updateResult(nameCard);
        } else {
            alert("명함 인식 결과가 존재하지 않습니다.");
        }
    } catch (error) {
        console.error("OCR 요청 중 오류:", error);
        alert("OCR 요청 중 오류가 발생했습니다: " + error.message);
    }
}

/**
 * OCR 결과를 화면에 표시하는 함수
 * nameCard는 예: { name: [{ text: '홍길동' }], company: [...], department: [...], ... }
 */
function updateResult(nameCard) {
    // 각 필드가 배열이므로, 내부의 text 속성만 추출해서 표시
    const getText = (arr) => {
        if (!arr || arr.length === 0) return '';
        return arr.map(item => item.text).join(', ');
    };

    // HTML의 특정 id 요소에 결과 표시 (존재한다고 가정)
    document.getElementById('name').textContent = getText(nameCard.name);
    document.getElementById('company').textContent = getText(nameCard.company);
    document.getElementById('department').textContent = getText(nameCard.department);
    document.getElementById('address').textContent = getText(nameCard.address);
    document.getElementById('position').textContent = getText(nameCard.position);
    document.getElementById('mobile').textContent = getText(nameCard.mobile);
    document.getElementById('tel').textContent = getText(nameCard.tel);
    document.getElementById('email').textContent = getText(nameCard.email);
    document.getElementById('homepage').textContent = getText(nameCard.homepage);
}
