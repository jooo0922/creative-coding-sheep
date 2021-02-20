'use strict';

export class Sheep {
  // 생성자의 파라미터는 드로잉을 위한 이미지 에셋,
  // 그리고 양이 처음 등장할 때 브라우저 오른쪽 끝에서 등장해야 하니까 stageWidth를 파라미터로 받음.
  constructor(img, stageWidth) {
    this.img = img; // 이미지 에셋이 담긴 객체를 할당해 줌.

    this.totalFrame = 8; // 아까 그린 양이 8프레임으로 나눌 수 있으니까 Total 프레임을 8로 하고
    this.curFrame = 0; // 현재 프레임은 0으로 정의함.

    this.imgWidth = 360;
    this.imgHeight = 300; // 이미지 크기는 양 그림 한 장(즉, 한 프레임)의 넓이와 높이로 함. (image sprite의 높이값과 width를 8로 나눈 값들이겠지?)

    this.sheepWidth = 180;
    this.sheepHeight = 150;
    // 실제 캔버스에 그려질 양의 크기는 레티나 디스플레이를 고려해 절반 사이즈로 잡아줌.
    // why? 픽셀 수가 가로, 세로 2배씩 늘었으니 픽셀의 단위크기도 가로, 세로 2배씩 늘어남.
    // 이 상황에서 360, 300 그대로 써주면 너무 크게 렌더가 될 것 같아서 180, 150, 즉, 절반으로 줄여준 것.
    // 레티나가 아닌 상태에서 360, 300으로 그려진 사이즈와 같다고 보면 됨.

    this.sheepWidthHalf = this.sheepWidth / 2; // sheepWidth의 절반 값을 이용해서 sheep의 좌표값을 sheep의 하단 중앙으로 위치시키려고 만든거
    this.x = stageWidth + this.sheepWidth; // 처음 생성되서 캔버스에 그려지는 양의 초기 x좌표값.
    this.y = 0;
    this.speed = Math.random() * 2 + 1;
    // 속도값(즉, sheep 좌표값의 변화량이겠지?)을 1 ~ 3 사이의 랜덤한 숫자로 할당함. (랜덤값 범위 구하는 공식)

    // 이 사람이 sprite image를 만들때 Adobe Animate에서 정해준 fps값이 24여서 여기서도 그대로 사용하기로 함.
    // 왜냐하면, 애초에 이 8프레임의 sprite image가 24fps를 기준으로 만들어서 뽑아진거기 때문에.
    this.fps = 24;
    // fpsTime를 정의해 줌. 1000ms를 24fps로 나눴을 때 프레임 하나가 실행될 때까지의 시간(대략 41.666...ms)이겠지?
    // 이 fpsTime값이 실제 requestAnimationFrame()의 타임스탬프와 비교값이 됨.
    this.fpsTime = 1000 / this.fps;
  }

  draw(ctx, t, dots) {
    /*
    this.curFrame += 1; // 현재 프레임(curFrame)을 매 프레임마다 계속 증가시켜 줌.
    if (this.curFrame === this.totalFrame) {
      // 현재 프레임이 전체 프레임과 같아지는 순간 다시 첫번째 프레임으로 초기화해 줌.
      this.curFrame = 0;
    }
    */
    // 계속 보다보면 이전 프레임의 잔상들이 clear되지 않는 현상도 발생함. 
    // why? sheep-controller.js의 draw()메소드에서 200프레임이 지날때마다 sheep 인스턴스를 계속 추가해주는
    // addSheep()메소드를 호출시키는 거임. 근데 지금은 계속 같은 자리에서 sheep 인스턴스를 반복 호출시키니까
    // 200프레임마다 같은 자리에 양이 여러 마리가 반복해서 그려지는 것.

    // 또 그냥 이렇게만 끝내버리면 양이 너무 방정맞게 빨리 걷는 느낌이 든다. 
    // why? sprite를 만들때의 fps(24fps)와 requestAnimationFrame의 fps(60fps)가 다르기 때문에 속도가 더 빨라진 것.
    // 이제 fps 개념을 적용해서 수정한 코드를 작성해보자.
    if (!this.time) {
      this.time = t;
      // 여기 t에는 모듈끼리 타고타고 거슬러가다 보면 결국 app.js에서 호출한 
      // requestAnimationFrame에서 콜백함수로 넘겨준 DOMHighResTimeStamp가 들어있음.
      // 따라서 this.time에 이 타임 스탬프를 할당하여 시간으로 정의함.
      // t값은 결국 1000/60ms(60fps상에서 한 프레임을 처리하는데 걸리는 시간. 대략 16.6666...ms)이 프레임이 지날때마다
      // 계속 더해진 값이 될거임. 그니까 계속 증가할거라는 뜻이지. 
      // 실제로 app.js의 animate()메소드에서 한 프레임마다 계속 t값을 콘솔로 찍어보면 프레임마다 대략 16.6정도가 항상 차이가 남.

      // 어쨋든 타임 스탬프의 개념이 이러한데, 지금 if 조건문이 뭐지? this.time값이 undefined일 때에만
      // this.time에 t값을 넣어주라는 거잖아. 그니까 처음에(첫 프레임) this.time은 값이 비어있으니
      // 첫 프레임의 t값이 this.time에 들어갈거고 
      /**
       * 참고로 this.time을 콘솔로 찍어보면 undefined가 여러번 나오는 것을 확인할 수 있는데
       * 이거는 sheep 하나의 애니메이션에서 this.time에 undefined가 여러번 할당되는 게 아니라!
       * new Sheep의 새로운 인스턴스가 생성될 때마다 각 양들의 첫번째 프레임에서는 this.time이 할당되지 않기 때문에
       * undefined가 여러번 호출이 되는거임. 실제로 하나의 양 애니메이션에서 this.time이 undefined가 되는 순간은
       * 맨 첫번째 프레임에서 말고는 없다.
       */
    }

    // 첫 프레임에서 t와 this.time은 같은 값이므로 now는 0이고 
    const now = t - this.time;
    // 이 this.time의 시간을 내가 정한 fps 시간(this.fpsTime)과 비교하는 코드를 만듦.
    // 0은 41.666...보다는 작으니까 if block이 미시행 될거고, 현재 프레임(curFrame)이 증가되지 않겠지

    // 두번째 프레임부터는 this.time은 undefined가 아니니까 상단의 if block이 실행되지 않고,
    // now값은 이론상 '이전 프레임의 t보다 16.66..ms가 증가한 t값'에 '맨 처음 프레임의 t값이 들어간 this.time'을 빼니까
    // 약 16.66...ms가 들어가겠지.
    // 그렇지만 아직도 16.66... < 41.66... 이므로 하단의 if block은 실행되지 않을 것이다.

    // 이런 과정이 매 프레임마다 반복되면서 이론상 세번째 프레임에서 now는 약 33.33..., 네번째 프레임에서 now는 약 49.999 이니까
    // 네 번째 프레임부터는 하단의 if block이 수행되겠지?
    // 자 그럼 this.time은 맨 처음 프레임의 t값에서 네번째 프레임의 t값이 할당될거고(당연히 값이 더 커졌겠지)
    // 현재 프레임(curFrame)이 +1 되어서 양 이미지가 다음 프레임으로 넘어가게 되는 것.

    // 이제 네번째 프레임의 this.time은 값이 꽤 커졌기 때문에 now에서 마찬가지로 증가한 t에서 빼줬을 때 
    // now가 this.fpsTime보다 작아지게 해줄 수 있음. 즉, 하단 if block의 실행.. 
    // 즉, curFrame의 증가를 지연시켜줄 수 있다는 거지!
    // 이런식으로 requestAnimationFrame이 매 프레임마다 콜백에 리턴해주는 타임 스탬프값을 이용하여
    // 60fps -> 24fps로 애니메이션이 렌더되는 것처럼 보이게 해줄 수 있다는 거임.

    // 절대 착각하지 말아야 할 것은, app.js의 animate()는 당연히 계속 60fps로 실행되고 있다는 거임.
    // 정확히 말하면 image sprite을 crop하는 x좌표값을 변화시켜주는 값(this.curFrame)을
    // 대략 24fps의 속도로 증가시켜줌으로써 'image가 24fps로 움직이는 것처럼' 보이게 해준 것!
    if (now > this.fpsTime) {
      this.time = t;
      this.curFrame += 1;
      if (this.curFrame === this.totalFrame) {
        this.curFrame = 0;
      }
    }
    // 어쨋든 이런 식으로 image sprite의 fps가 requestAnimationFrame의 fps가 서로 다를 경우,
    // 또는 fps를 낮춰서 느리게 해주고 싶은 경우 이런 식으로 코드를 작성해주면 된다. 
    this.animate(ctx, dots);
  }

  animate(ctx, dots) {
    // 먼저 양 위치에 검은색 박스를 한 번 그려볼 것.
    // 양의 중심점을 하단 가운데로 잡아서 언덕의 곡선 좌표를 따라갈 수 있도록 할 것.
    // this.x = 650;
    // this.y = 550;

    // 이번에는 200프레임 간격으로 여러 개 생성되는 양들이 랜덤한 this.speed(x좌표값 변화량)에 따라
    // 각자 다른 속도로 브라우저의 왼쪽 끝에서 오른쪽 방향으로 움직이도록 만들어보자
    // 이렇게 this.x에는 원래의 x좌표값(브라우저 width에 양 프레임 하나의 width를 더한 값. 즉, 처음에는 브라우저 왼쪽 바깥에서 생성될거임)
    // 에다가 각 양들마다 1 ~ 3 사이로 랜덤하게 할당받는 this.speed만큼을 계속 빼주면
    // 모든 양들의 this.x의 좌표값들이 각자의 속도로 점점 브라우저의 왼쪽을 향해서 움직이게 될 거임.
    this.x -= this.speed;

    // 이렇게 하면 closest에는 getY에서만 return받은 {y: 0, rotation: 0} 라는 객체가 맨 처음 할당되지만,
    // getY에서 호출한 getY2에서 return받은, 
    // 현재 프레임에서 양의 x좌표값과 가장 근사한 곳에 위치한 pt의 x, y좌표값이 담긴 객체가 매 프레임마다 새롭게 할당될거임.
    const closest = this.getY(this.x, dots);
    this.y = closest.y;

    /*
    ctx.save(); // 현재 원점의 좌표 (0, 0)을 저장해놓음.
    ctx.translate(this.x, this.y); // 원점을 (this.x, this.y)로 이동시킴
    ctx.fillStyle = '#000000';
    ctx.fillRect(
      -this.sheepWidthHalf, // 검은색 박스의 x좌표값은 this.x에서 왼쪽으로 sheepWidthHalf(90)만큼 이동함. 그래야 this.x를 박스의 가운데로 위치시킬 수 있음.
      -this.sheepHeight + 20, // y좌표는 this.y에서 -170만큼 하고 나서
      this.sheepWidth,
      this.sheepHeight // 박스의 높이값을 this.sheepHeight, 즉 150만큼 그려줌. 위에서 더해준 20은 박스 하단과 곡선 사이에 대충 20정도의 여백을 준 것.
    ); // 이렇게 하면 박스의 가운데 하단이 중심점이 되어 (this.x, this.y) 자리에 위치할 수 있게 됨.

    ctx.restore(); // 저장했던 캔버스의 원래 상태((0, 0)이었던 원점의 좌표)로 복구시켜줌.
    // 캔버스를 회전시킬 것이기 때문에 이렇게 정의해준 것
    */

    // 그럼 이제 검은색 박스 자리에 양을 그려볼 것이다. drawImage()메소드를 이용할 것.
    // 그 안에 들어가는 parameter들은 필기내용 또는 MDN에서 다시 확인해볼 것.
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(closest.rotation); // atan2로 return받은 각도를 수평으로 맞추고, 그 값만큼 회전시켜주면 자연스럽게 곡선을 따라가는 움직임을 볼 수 있음.
    ctx.fillStyle = '#000000';
    ctx.drawImage(
      this.img, // 이미지 에셋이 담긴 객체를 첫번째 파라미터 자리에 넣어주고
      // 이미지 원본에서 가져올 x좌표값. 
      // 매 프레임마다 draw 함수에서 curFrame값을 바꿔주면 image sprite 상에서 잘라줄 x좌표값, 
      // 즉 몇 번째 프레임의 x위치값에서부터 잘라줄 지도 항상 바뀔테니까 
      // 1 ~ 8번째 프레임들이 반복해서 crop되면서 캔버스에 렌더될거임
      this.imgWidth * this.curFrame,
      0, // 이미지 원본에서 가져올 y좌표값은 항상 동일함. image sprite에서 프레임이 하나의 row에 다 그려져 있으니까.
      // 이미지 원본에서 crop해올 width값. 
      // 사전에 정의해놓은 sprite 상에서의 프레임 하나의 실제 width 길이
      this.imgWidth,
      // 이미지 원본에서 crop해올 height값. 
      // 사전에 정의해놓은 sprite 상에서의 프레임 하나의 실제 height 길이
      this.imgHeight,
      -this.sheepWidthHalf,
      -this.sheepHeight + 20,
      this.sheepWidth,
      this.sheepHeight
      // 마지막 4개는 검은색 박스를 테스트삼아 그려보던 것과 마찬가지로
      // 양의 가운데 하단을 중심점으로 (this.x, this.y)에 배치할 수 있도록 
      // 실제 캔버스상에 그려질 x, y좌표값과 width, height을 할당해준 것.
    );

    ctx.restore();
  }

  // 이제 양의 x값에 맞는 곡선의 y값을 가져오면 되는데
  // 언덕의 곡선이 하나가 아니라 여러 개가 연결된 거잖아?
  // 그래서 우선 어떤 곡선이 양의 x값에 해당하는지 확인하는 함수를 만들어야 함. 
  getY(x, dots) {
    for (let i = 1; i < dots.length; i++) {
      // 맨앞 언덕을 구성하는 여러 곡선들의 각각의 x1, x3좌표값 사이에 양의 x좌표값이 존재하는지 확인
      if (x >= dots[i].x1 && x <= dots[i].x3) {
        return this.getY2(x, dots[i]);
        // 존재한다면 양의 x좌표값과 해당하는 곡선의 좌표값들이 담긴 dots[i] 번째 객체를 getY2로 넘겨주면서 호출함.
      }
    }

    return {
      y: 0,
      rotation: 0
    };
  }

  // 그리고 그 곡선의 비율 t를 한 200 정도, 즉 200개의 촘촘한 비율로 곡선을 나누고
  // x값과 가장 근사한 값의 곡선의 좌표를 가져온다.
  getY2(x, dot) {
    const total = 200;
    let pt = this.getPointOnQuad(dot.x1, dot.y1, dot.x2, dot.y2, dot.x3, dot.y3, 0); // 양의 x좌표가 해당돠는 곡선의 맨 처음에 위치한 포인트의 x, y 좌표값
    let prevX = pt.x; // 맨 처음에는 양의 x좌표가 해당되는 곡선의 앞부분에 위치한 point의 x좌표값이 이전 x좌표값으로 할당됨.
    for (let i = 1; i < total; i++) {
      const t = i / total; // t의 값은 1/200 ~ 199/200(t가 거의 1에 가까운 값) 사이의 199개의 값들로 할당됨.
      pt = this.getPointOnQuad(dot.x1, dot.y1, dot.x2, dot.y2, dot.x3, dot.y3, t);
      // 지금 하나의 곡선의 비율을 200개의 촘촘한 비율로 나눠서 해당 비율에 따른 x, y좌표값이 pt에 들어가겠지

      // 그리고 양의 x좌표값이 이전 point와 현재 pt의 x좌표값 사이에 위치한다면 현재 pt를 return해줌.
      if (x >= prevX && x <= pt.x) {
        return pt;
      }
      // 그리고 prevX(이전 포인트의 x좌표값)에는 현재의 pt의 x좌표값을 override해줌.
      prevX = pt.x;
    }
    return pt; // for loop에서 return받은 pt를 메소드의 마지막 부분에서 최종적으로 return해줌.
  }

  // 저 위에서 this.x값의 움직임을 정해줬으니 this.y값을 찾아야 함. this.y값은 언덕의 곡선을 따라가지?
  // 그 말은 언덕 곡선 위에 내가 원하는 좌표를 찾아야 한다는 뜻.
  // 수학을 잘하면 이런 걸 쉽게 찾겠지만, 모든 사람이 다 수학을 잘하는 것은 아님!
  // 이런 거에 답을 해줄 사수나 멘토를 찾기도 어렵다.
  // 하지만 예전과 다른 것은 이제는 구글 검색하면 웬만한 수학 질문은 다 답을 얻을 수 있음.
  // 그래서 검색으로 곡선에 대해서 정의한 페이지(위키백과 Bézier curve)를 찾아보면
  // Quadratic Bézier curve일 때(언덕을 Quadratic Bézier curves로 만들었으니까), 비율 t에 따른 좌표를 찾는 수학 공식을 볼 수 있다!
  // B(t) = (1 - t)²P₀ + 2(1 - t)tP₁ + t²P₂ 단, 0 <= t <= 1 사이의 값임.
  // 이 공식을 그대로 코드로 만들면 아래와 같이 함수를 하나 만들 수 있다.
  // 비율에 따른 좌표찾기 내용이 잘 이해가 안간다면 리온산스 영상을 참고해서 볼 것.

  // 그니까 이게 뭐냐면 언덕 하나에 존재하는 여러 곡선들에 대해서
  // 우리가 알 수 있는 좌표값들은 각 Quadratic Bézier curve에 대한 이전 좌표값, 현재좌표값, 중간좌표값 밖에 없잖아?
  // 왜냐면 hill.js에서 그 3개의 좌표값만 가지고 Quadratic Bézier curve를 만들었으니까!
  // 근데 양의 x좌표값의 위치에 따라서 그와 동일한 x좌표값을 갖는 언덕 곡선 지점의 y좌표값을 양의 this.y로 할당해주려는 거지 매 프레임마다!
  // 그러려면 뭘 알아야 될까? 이 곡선의 처음부터 끝까지 모든 촘촘한 점들의 x, y좌표값을 알아야
  // 현재 프레임에서 양의 x좌표값이 곡선의 어느 지점의 x좌표값과 일치하는 지 확인해서, 그 곡선 지점의 y좌표값을
  // 양의 y좌표값인 this.y에 매 프레임마다 할당해줄 수 있지 않을까? 
  // 그래서 곡선의 각 비율(좀 이해가 쉽게 얘기하자면 각 지점? 각 위치?)에 따른 좌표값를 찾으려고 하는거고,
  // 그래서 위의 공식에서 t가 0 ~ 1 사이의 값이라고 정한 이유가, 곡선의 처음과 끝 지점의 비율을 각각 0 ~ 1 사이라고 가정한거임. 

  // 그래서 이 함수는 하나의 Quadratic curve 안에 존재하는
  // p1, p2, p3이라는(각각 start point, control point, end point)의 x좌표값, 또는 y좌표값과 비율 t를 넣어주면
  // 해당 비율에 위치하는 x좌표값, 또는 y좌표값을 계산해주는 공식을 함수로 만든 것.
  getQuadValue(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2
  }

  getPointOnQuad(x1, y1, x2, y2, x3, y3, t) {
    // 아래에서 만든 quadTangent 함수를 이용해서 
    // 각도를 구하는 함수 중에 하나인 Math.atan2를 사용해서 각도를 가져옴.
    const tx = this.quadTangent(x1, x2, x3, t);
    const ty = this.quadTangent(y1, y2, y3, t);
    // 참고로 Math.atan2(y, x)는 '양의 x축'과 '(0, 0)에서 (x, y)까지 연결한 선'이 이루는 각도를 radian으로 return해줌.
    // 내 생각에는 원래 Math.atan2는 (y, x) 순으로 전달해줘야 하는데 -를 붙여주면 (x, y)순으로 전달해줄 수 있는 듯.
    const rotation = -Math.atan2(tx, ty) + (90 * Math.PI / 180);
    // 또 atan2는 수직의 각도를 구하는 방법인데 이걸 수평으로 변환해야 하니까 90도를 더해주면 됨.
    // atan2의 리턴값은 radian이기 때문에 더해주는 90도 역시 radian으로 변환된 값을 넣어줘야 함.

    return {
      x: this.getQuadValue(x1, x2, x3, t),
      y: this.getQuadValue(y1, y2, y3, t),
      rotation: rotation
    }
  }

  // 그리고 양이 곡선을 따라 움직이기는 하지만, 또 중요한 게 언덕의 기울기에 따라 회전하면서 움직여야 함.
  // 그 말은, 곡선 위의 좌표의 기울기를 찾는 공식을 알아야 한다는 뜻.
  // 이번에는 stack overflow에서 찾아보자. 이미 누군가가 내가 궁금했던 질문과 비슷한 질문을 한 걸 찾을 수 있다.
  // 여기의 설명에 따르면 곡선위의 좌표에 수직으로 된 기울기를 찾는 방법임.
  // 정확히 말하면 곡선위의 좌표와 연결해서 수직으로 된 기울기 선을 만들 수 있는 x, y 좌표값을 구하는 공식같음.
  // The derivative f'(t) =  2(1-t)(b-a)+2(c-b)t
  // 이렇게 공식을 가져와서 내 코드에 함수로 만들어주고
  quadTangent(a, b, c, t) {
    return 2 * (1 - t) + (b - a) + 2 * (c - b) * t;
  }
}

// 이런 식으로 복잡해보이는 코드라고 해도 수학을 못한다고 해도
// 구글에 검색하면 이미 원하는 내용들이 다 찾아볼 수 있기 때문에 모든 복잡한 코드가 다 이런식으로 만들어짐.