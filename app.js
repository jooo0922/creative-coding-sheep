'use strict';

import {
  Hill
} from './hill.js'

// 양 떼 관리자 class를 추가해 줌.
import {
  SheepController
} from './sheep-controller.js'

import {
  Sun
} from './sun.js'

class App {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);

    this.sun = new Sun();

    // 생성자에서 바로 3개의 Hill 인스턴스들을 생성한 뒤에 this.hills에 담아놓음.
    this.hills = [
      // 언덕마다 구분이 갈 수 있게 색상값을 다르게 전달해주고
      // 속도도 뒤에 있는 언덕일수록 느리게 움직이고, 앞에 있는 언덕은 빠르게 움직이게 해주면 3d같은 효과를 볼 수 있음.
      // 거기에 뒤에 있는 언덕일수록 point를 좀 더 추가해서 촘촘한 언덕이 되도록 만듦.
      new Hill('#fd6bea', 0.2, 12), // point가 총 12개인 언덕이 그려질거임.
      new Hill('#ff59c2', 0.5, 8),
      new Hill('#ff4674', 1.4, 6) // 가장 앞에 나오는 언덕이 될거임
    ]

    this.SheepController = new SheepController(); // 양 떼 관리자의 인스턴스를 바로 생성해 줌.

    window.addEventListener('resize', this.resize.bind(this), false);
    this.resize();

    requestAnimationFrame(this.animate.bind(this));
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * 2;
    this.canvas.height = this.stageHeight * 2;
    this.ctx.scale(2, 2);

    // 태양이 전체 레이어상에서 가장 아래에 위치하게 그려야 하니까 호출하는 순서를 잘 확인할 것.
    this.sun.resize(this.stageWidth, this.stageHeight);

    // this.hills에 담긴 Hill 인스턴스들의 개수만큼 for loop를 반복하여
    // 각각의 Hill 인스턴스들의 resize 메소드에 리사이징된 브라우저 width, height값을 전달해 줌.
    for (let i = 0; i < this.hills.length; i++) {
      this.hills[i].resize(this.stageWidth, this.stageHeight);
    }

    // 리사이즈된 브라우저의 사이즈를 this.SheepController.resize()메소드로 넘겨줌.
    this.SheepController.resize(this.stageWidth, this.stageHeight);
  }

  animate(t) {
    requestAnimationFrame(this.animate.bind(this)); // 내부 호출해서 스스로 반복할 수 있도록 해줌.

    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); // 매 프레임마다 캔버스를 깨끗하게 지워주는 코드

    // 태양이 전체 레이어상에서 가장 아래에 위치하게 그려야 하니까 호출하는 순서를 잘 확인할 것.
    this.sun.draw(this.ctx, t);

    let dots; // hill.js의 draw 메소드에 있는 dots랑 다른 애임.
    for (let i = 0; i < this.hills.length; i++) {
      // this.hills에 담긴 Hill 인스턴스들의 개수만큼 for loop를 반복하여
      // 각각의 Hill 인스턴스들의 draw메소드를 호출하여 실제 캔버스에 렌더하고, 
      // this.hills[i].draw 메소드로부터 
      // 언덕 하나의 point별로 '이전 중간 좌표값, 이전 포인트 좌표값, 현재 중간 좌표값'이 담긴 객체들을 모아놓은
      // dots(hill.js) 배열을 리턴받아 dots(app.js)에 할당함.
      dots = this.hills[i].draw(this.ctx);
      // 결과적으로 dots(app.js)에는 this.hills[2].draw(this.ctx)에서 리턴받는 dots(hill.js)만 override 될거임.
      // 가장 앞에 배치된 언덕의 곡선 좌표값 배열만 들어가게 되는 것. 왜냐고?
      // 어차피 이게 양의 좌표를 찾으려고 쓰는건데 양은 맨앞의 언덕에서만 움직이게 할거니까. 맨앞의 언덕의 좌표값만 있으면 됨. 
    }

    // animate() 메소드에서도 양을 그려주는 this.SheepController.draw를 호출시켜서 
    // 프레임마다 반복적으로 실행하여 애니메이션을 그려줄 수 있도록 함.
    // 여기서 맨 앞의 언덕의 곡선 좌표에 양을 그려줄 거니까 위에 for loop 안에서 this.hill[2].draw에서 리턴값으로 받은
    // 언덕의 곡선 좌표를 draw메소드의 dots 자리로 넘겨줬음.
    // 또, fps를 위한 타임스탬프를 t 파라미터로 넘겨줌.
    /**
     * requestAnimationFrame() 함수의 콜백함수에는 타임 스탬프(DOMHighResTimeStamp)를 파라미터로 넘겨받게 되어있음.
     * 이걸 이용하면 fps를 정의할 수 있음.
     */
    this.SheepController.draw(this.ctx, t, dots);
  }
}

window.onload = () => {
  new App();
}