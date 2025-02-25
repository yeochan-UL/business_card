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

    // 2) 서버로 OCR 요청 (로딩 시작)
    showLoading(true);
    recognizeText(file);
});

async function recognizeText(file) {
    const url = 'https://ocr-proxy.vercel.app/name-card';
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

        if (result.images && result.images.length > 0 && 
            result.images[0].nameCard && result.images[0].nameCard.result) {
            
            const nameCard = result.images[0].nameCard.result;
            updateResult(nameCard);
        } else {
            alert("명함 인식 결과가 존재하지 않습니다.");
        }
    } catch (error) {
        console.error("OCR 요청 중 오류:", error);
        alert("OCR 요청 중 오류가 발생했습니다: " + error.message);
    } finally {
        // 로딩 종료
        showLoading(false);
    }
}

/**
 * OCR 결과를 화면에 표시하는 함수
 */
function updateResult(nameCard) {
    const getText = (arr) => (!arr || arr.length === 0) ? '' : arr.map(item => item.text).join(', ');

    // 각 필드 값 업데이트
    document.getElementById('name').textContent = getText(nameCard.name);
    document.getElementById('company').textContent = getText(nameCard.company);
    document.getElementById('department').textContent = getText(nameCard.department);
    document.getElementById('address').textContent = getText(nameCard.address);
    document.getElementById('position').textContent = getText(nameCard.position);
    document.getElementById('mobile').textContent = getText(nameCard.mobile);
    document.getElementById('tel').textContent = getText(nameCard.tel);
    document.getElementById('email').textContent = getText(nameCard.email);
    document.getElementById('homepage').textContent = getText(nameCard.homepage);

    // 데이터 표시
    document.getElementById('result').style.display = 'block';
}

/**
 * 로딩 표시 함수
 */
function showLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    const resultElement = document.getElementById('result');

    if (isLoading) {
        loadingElement.style.display = 'block';  // 로딩 표시
        resultElement.style.display = 'none';    // 데이터 숨김
    } else {
        loadingElement.style.display = 'none';   // 로딩 숨김
        resultElement.style.display = 'block';   // 데이터 표시
    }
}
