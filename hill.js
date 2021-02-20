'use strict'

// 언덕은 일정 간격을 가진 좌표값을 곡선으로 연결해서 언덕처럼 보이게 만들거임.
// waves 만들었을 때랑 동일한 원리
export class Hill {
  // 언덕은 하나가 아닌 여러개의 다양한 언덕을 만들 수 있도록
  // 색상, 속도, 언덕의 포인트 개수를 parameter로 받아오게 함.
  constructor(color, speed, total) {
    this.color = color;
    this.speed = speed;
    this.total = total;
  }

  // 브라우저(stage) 사이즈를 파라미터로 받아옴
  resize(stageWidth, stageHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    // for loop에서 만든 포인트들의 좌표값이 담긴 포인트 객체들을 담아놓을 배열
    this.points = [];
    // Math.ceil() 함수는 주어진 숫자보다 크거나 같은 숫자 중 가장 작은 숫자를 integer 로 return함.
    // 포인트 개수를 스테이지 넓이로 딱 맞게 나누지 않고 total 개수에서 2 정도 뺀 값으로
    // 즉, 포인트 사이의 간격값을 좀 더 넓게 정의해서 언덕이 브라우저(stageWidth)보다 넓게 그려지도록 함.
    // 그래야 나중에 양을 그릴 때 화면 밖에서부터 자연스럽게 걸어오는 양을 만들 수 있음.
    // 무슨 얘기냐면, stageWidth를 더 적은 개수의 point로 나눠야 this.gap에 더 큰 값이 할당될 거라는 뜻이지.
    // 다만 for loop에서 그 간격을 이용하여 total point 갯수만큼 point x좌표값을 담아놓으면 
    // 브라우저 width를 넘어가는 사이즈의 언덕을 만들 수 있다는 것.
    this.gap = Math.ceil(this.stageWidth / (this.total - 2));

    for (let i = 0; i < this.total; i++) {
      this.points[i] = {
        x: i * this.gap,
        y: this.getY() // 각 point의 y좌표값은 getY 함수를 사용해서 랜덤으로 정의함.
      };
    }
  }

  // 실제로 언덕을 캔버스에 그리는 draw 메소드
  draw(ctx) {
    // parameter로 전달받은 color를 컬러값으로 할당.
    ctx.fillStyle = this.color;
    ctx.beginPath(); // 언덕 path 그리기 시작함.

    let cur = this.points[0]; // cur(current point)에 맨 첫번째 point 좌표값이 담긴 객체를 할당해놓음.
    let prev = cur; // prev에는 이전 point의 좌표값(여기서는 첫번째 point)이 담긴 cur를 할당함.

    // for loop에서 만든 곡선의 좌표를 나중에 양의 좌표를 찾는데 써야하기 때문에
    // 이 dots 배열에다가 그 좌표값들을 저장해두려고 만든 거임.
    let dots = [];

    // 언덕을 움직이게 해주려면 그려질 때 x좌표에 this.speed를 더해주면 됨
    // draw(ctx) 메소드는 app.js의 animate 메소드에서 호출되기 때문에 매 프레임마다 반복해서 호출되고 그려질거임.
    // 그렇기 때문에 여기서 각 포인트들의 x값에 this.speed를 더해주면 x방향으로 움직여보일텐데
    // 지금 여기의 cur.x는 첫번째 포인트의 x좌표값만 들어있기 때문에 이거는 첫번째 point만 움직이게 하는 거
    cur.x += this.speed;

    // draw 메소드가 반복적으로 호출되면서 캔버스에 그리다보면 언덕이 점점 오른쪽으로 움직이게 되고
    // 언덕 맨 왼쪽이 잘려보이게 나온다.
    // 이걸 해결하려면 언덕의 x좌표 시작점(첫번째 포인트의 x좌표점)이 오른쪽으로 움직이기 전에 
    // 새로운 point를 this.points 배열의 맨 앞쪽에 추가해주면 곡선이 계속 그려지면서 이어진 형태의 움직이는 언덕이 완성됨.
    // cur.x는 처음에는 0이니까 당연히 -this.gap보다는 크겠지? 그럼 바로 if block을 수행할거임.
    if (cur.x > -this.gap) {
      // unshift() 메서드는 새로운 요소를 배열의 맨 앞쪽에 추가하고, 새로운 길이를 반환함.
      this.points.unshift({
        // 처음에는 this.gap * 2 만큼 화면 왼쪽으로 벗어난 곳에 point를 생성하고,
        // 얘를 unshift하니까 얘가 첫번째 포인트로 되겠지. 
        // (그래서 맨 처음 포인트와 맨 처음 unshift된 포인트는 간격 차이가 this.gap * 2 만큼 나게 됨.)
        // 이후 시간이 지나면서 프레임들이 몇 번 그려진 뒤 이번에는 해당 point의 x좌표값이 0에 도달하지 않아도 
        // -this.gap에만 도달하는 순간 -this.gap * 2 위치에 point를 또 만들고 걔를 첫번째 포인트로 unshift 함.
        // (이때부터는 이전에 unshift된 포인트와 현재 unshift된 포인트의 간격 차이는 this.gap 만큼으로 돌아옴.) 
        x: -(this.gap * 2),
        y: this.getY()
      });
    }
    // 현재의 언덕 곡선의 맨 오른쪽에 있는 point가 화면의 일정 영역 이상에서 사라지면 
    // this.points 배열에서 해당 points를 빼줌으로써 배열이 무한정 늘어나지 않도록 관리함.
    // 이라고 하는데... else if 조건문은 이 사람이 코드를 잘못 짠거같다.
    // cur.x는 항상 this.points의 0번째 point의 x좌표값만 참고하는데, 
    // cur.x가 -this.gap까지만 가도 위에 if block에 의해서 0번째 point가 항상 새롭게 생성이 된다.
    // 이 말은 this.points의 0번째 point의 x좌표값이 this.stageWidth + this.gap까지 갈 수가 없음.
    // 그래서 this.points의 맨 끝의 요소가 삭제되지 않고 계속 무한정 길어지게 됨.
    // else if (cur.x > this.stageWidth + this.gap) {
    if (this.points[this.points.length - 1].x > this.stageWidth + (this.gap * 2)) {
      // 이 사람의 의도대로 하려면 조건문을 요렇게 작성하는 게 맞을거임.
      // this.gap * 2를 더해주는 이유는, 그냥 this.gap으로 더해주면 point 하나만 화면 밖으로 벗어났을 때 splice됨.
      // 그러다보니 현재 화면 내에서 가장 오른쪽에서 움직이는 point와의 연결이 사라져서 곡선이 툭툭 꺾이거나 변형이 됨.
      // 그래서 point 두 개가 화면 밖으로 벗어났을 때부터 splice 해줘야 화면 안의 곡선이 꺾이는 현상이 사라짐.
      this.points.splice(-1);
      // splice() 메서드는 배열의 기존 요소를 삭제, 교체, 또는 새 요소를 추가함. 여기서는 삭제하려고 쓰인 것.
      // splice(start) start에 들어가는 parameter는 배열의 변경을 시작할 인덱스값. 
      // 음수인 인덱스가 들어가면 배열의 끝에서부터 역순으로 세어나감. -n은 array.length - n 번째 인덱스와 같음. 
    }

    ctx.moveTo(cur.x, cur.y); // 맨 첫번째 point 좌표값에서 path를 시작하는 거

    // prevCx, Cy에는 이전 point와 전전 point 사이의 중간 지점 좌표값이 들어가게 됨.
    // 맨 처음에는 그냥 이전 point의 x, y 좌표값이 들어감.
    let prevCx = cur.x;
    let prevCy = cur.y;

    // let i = 1부터 시작하니까 두 번째 point부터 for loop를 시작하겠지.
    for (let i = 1; i < this.points.length; i++) {
      cur = this.points[i]; // cur에 들어가는 현재 point 좌표값을 cur에 override 해주고

      // 언덕을 움직이게 해주려면 그려질 때 x좌표에 this.speed를 더해주면 됨
      // 첫번째 포인트 이후의 각 현재 포인트들의 x 좌표값에 매번 프레임마다 this.speed를 더해줌으로써
      // 언덕 하나의 모든 point들이 움직이게 되고, 
      // 그 point에 의해 만들어지는 prev.x, cx, 곡선들도 다같이 움직이게 됨.
      // 그 결과 언덕 전체가 x방향으로 움직이는 듯한 애니메이션을 줌.
      cur.x += this.speed;

      // 이전 point와 현재 point의 중간 지점 좌표값을 cx, cy에 각각 할당해주고
      const cx = (prev.x + cur.x) / 2;
      const cy = (prev.y + cur.y) / 2;

      // 항상 quadraticCurveTo에서는 이전 좌표값과 이전과 현재 사이의 중간 좌표값을 
      // parameter로 전달해줘야 곡선이 제대로 그려짐.
      ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);

      // for loop에서 만든 곡선의 좌표를 나중에 양의 좌표를 찾는데 써야하기 때문에
      // dots 배열에다가 각 point별로 '이전 중간 좌표값, 이전 포인트 좌표값, 현재 중간 좌표값'이 담긴 객체들을 모두 담아놓음.
      dots.push({
        x1: prevCx,
        y1: prevCy,
        x2: prev.x,
        y2: prev.y,
        x3: cx,
        y3: cy,
      });

      prev = cur; // prev에 들어갈 이전 point도 override 해주고
      prevCx = cx;
      prevCy = cy; // cx, cy에 이전의 중간 좌표값도 override 해줌.
    }

    // for loop가 끝난 뒤의 prev.x,y에는 항상 마지막 point의 좌표값이 담겨있게 됨.
    // for loop에서 quadraticCurveTo로 연결한 마지막 end point인 cx, cy에서 마지막 point 지점으로 연결하는 것.
    // 이 때 마지막 point는 stageWidth의 범위를 넘어갈 것이기 때문에 곡선이 브라우저 바깥으로 넘어가게 그려질 거임.
    ctx.lineTo(prev.x, prev.y);
    ctx.lineTo(this.stageWidth, this.stageHeight); // 브라우저의 오른쪽 끝으로 연결해 줌.
    ctx.lineTo(this.points[0].x, this.stageHeight); // 브라우저의 왼쪽 끝으로 연결해 줌.
    ctx.fill(); // 색 채우기

    return dots; // draw메소드를 수행하고 나면 dots 배열을 리턴값으로 넘겨 줌
  }

  // 언덕에 y좌표값을 랜덤으로 주기 위해서 만든 getY 메소드
  getY() {
    const min = this.stageHeight / 8; // 랜덤한 y좌표값의 최소값은 stageHeight을 8 정도로 나눈 값으로 잡음.
    const max = this.stageHeight - min; // min을 빼는 이유? return할 때 최소값인 min을 더해줘야 최대값이 this.stageHeight로 설정되니까.
    return min + Math.random() * max; // 이렇게 하면 min과 this.stageHeight 사이의 랜덤한 y좌표값을 return받음. 
    // random값의 범위 정하는 공식 복습할 것
  }
}