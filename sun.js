'use strict';

export class Sun {
  constructor() {
    this.radius = 200;

    this.total = 60; // 총 60개 정도의 원의 좌표를 구할 예정
    this.gap = 1 / this.total; // 360도를 촘촘히 쪼개는 비율값을 구한 것.
    this.originPos = [];
    this.pos = [];
    for (let i = 0; i < this.total; i++) {
      // for loop에 의해 getCirclePoint의 t 자리에는 1/60 ~ 59/60 으로 총 60개 정도의 비율값이 들어갈거고
      // 그럼 360도가 60개로 쪼개져서 각각의 각도에 따른 원 위의 x, y좌표값이 담긴 객체가 pos에 return되어 할당되겠지
      // 그리고 얘내들을 순서대로 originPos, pos에 담아놓도록 할 것.
      const pos = this.getCirclePoint(this.radius, this.gap * i);
      this.originPos[i] = pos;
      this.pos[i] = pos;
    }

    // fps도 30fps로 정의해줌.
    this.fps = 30;
    this.fpsTime = 1000 / this.fps;
  }

  // Sun 클래스도 다른 클래스들과 동일하게 리사이즈 함수와 draw 함수를 가짐.
  resize(stageWidth, stageHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    // sun의 캔버스상에 그려질 x, y좌표값을 할당해준 거겠지?
    this.x = this.stageWidth - this.radius - 140;
    this.y = this.radius + 100;
  }

  draw(ctx, t) {
    // sheep.js에서 60fps를 24fps로 낮춰보이도록 만든거랑 똑같이 한거임.
    // 차이점은 거기서는 24fps의 속도로 this.curFrame을 1씩 늘려줬다면
    // 여기서는 30fps의 속도로 this.updatePoints() 메소드를 수행하도록 한 것.
    if (!this.time) {
      this.time = t;
    }
    const now = t - this.time;
    if (now > this.fpsTime) {
      this.time = t;
      this.updatePoints();
    }

    ctx.fillStyle = '#ffb200'
    ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    // ctx.fill();
    // 원을 그리는 대신 updatePoints에서 매 프레임마다 새롭게 override되는 60개의 point들을
    // lineTo로 반복 연결해줄거임.
    let pos = this.pos[0]; // 맨 처음에는 0번째 point부터 시작하겠지
    // 여기서 중요한 점. 애초에 getCirclePoint에서 생성된 원의 좌표값은 
    // 원의 중심점 좌표가 (0, 0)이라는 것을 가정하고, 그걸 기준으로 원의 좌표값을 구해주는 공식임.
    // 하지만 실제 캔버스에서 Sun의 중심점 좌표는 (this.x, this.y)에 그려지지?
    // 그니까 pos.x, pos.y에 각각 this.x, this.y를 더해줘야 
    // 실제 캔버스상에서 sun의 중심점 좌표를 기준으로 override된 원의 좌표값들이 그려질거임.
    ctx.moveTo(pos.x + this.x, pos.y + this.y);
    // for loop에서 override된 원 위의 좌표들의 갯수만큼 반복해서
    // 다음 좌표들로 계속 lineTo를 그려줌
    for (let i = 1; i < this.total; i++) {
      const pos = this.pos[i];
      ctx.lineTo(pos.x + this.x, pos.y + this.y);
    }
    ctx.fill();
  }

  updatePoints() {
    for (let i = 1; i < this.total; i++) {
      // pos에는 생성자에서 만들어진, 맨 처음 sun의 원 위의 좌표값들이 변함없이 저장되어있는 
      // this.originPos[i]의 좌표값들이 순차적으로 할당됨.
      // 그니까 매 프레임마다 for loop에 의해 pos에는 60개의 원의 좌표들이 들어갈 것이고
      const pos = this.originPos[i];
      // this.pos[i]에는 this.ranInt에서 받은 랜덤값을 this.originPos[i]에서 받아온 좌표값과 더해서
      // 새롭게 좌표값을 override 해줌.
      // 결과적으로 매 프레임마다 this.originPos에는 변하지 않는 초기의 원 위의 좌표값들이 들어가있고
      // this.pos에는 updatePoints()에 의해 매 프레임마다 원 위의 모든 좌표값들이 새롭게 override 될거임.
      this.pos[i] = {
        x: pos.x + this.ranInt(5),
        y: pos.y + this.ranInt(5) // originPos에서 가져온 x, y좌표값에 0 ~ 5 사이의 랜덤값을 더해서 override해줌.
      }
    }
  }

  // 0 ~ max 사이의 랜덤한 값을 return해주는 함수를 만든 것.
  ranInt(max) {
    return Math.random() * max;
  }

  // 원 위의 모든 좌표들을 가져오는 방법
  // 지름의 비율에서 사인과 코사인 함수를 사용해서 가져올 수 있음.
  // 거기에 반지름을 곱하면 원 위의 각각의 좌표들이 나옴
  getCirclePoint(radius, t) {
    // Math.PI * 2는 360도의 라디안값이지? t는 이 360도를 촘촘하게 나눠줄 비율을 의미함.
    // 그래서 아래 return에서 비율에 따라 360도를 촘촘하게 나눠준 각도에 따라 해당 원의 좌표를 가져올 수 있도록 한 것.
    const theta = Math.PI * 2 * t;

    return {
      // 얘내는 원의 x좌표 = sin(angle) * 반지름, 원의 y좌표 = cos(angle) * 반지름 구하는 공식 알지? 그거로 한 것.
      x: (Math.cos(theta) * radius),
      y: (Math.sin(theta) * radius)
    }
  }
}