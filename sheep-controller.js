'use strict';

import {
  Sheep
} from './sheep.js'

// 양떼들을 관리하는 class를 만들어서 sheep.png 이미지 에셋도 공유하고 배열도 관리하도록 할 것.
export class SheepController {
  constructor() {
    // sheep.png 이미지를 로드하고 로드가 완료되면 this.loaded()에서 양을 추가할거임.
    this.img = new Image();
    this.img.src = 'sheep.png';
    this.img.onload = () => {
      this.loaded();
    };

    this.items = [];

    this.cur = 0;
    this.isLoaded = false;
  }

  resize(stageWidth, stageHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
  }

  loaded() {
    this.isLoaded = true; // 로드가 완료되면 isLoaded를 true로 바꾸고
    this.addSheep(); // 양을 추가하는 this.addSheep() 메소드를 호출함
  }

  addSheep() {
    // 양을 생성하는 Sheep class의 새로운 인스턴스를 생성해서 items 배열에 넣어놓음.
    this.items.push(
      new Sheep(this.img, this.stageWidth)
    );
  }

  // draw 함수에서 양을 그려줌
  draw(ctx, t, dots) {
    if (this.isLoaded) {
      // 이미지가 로드된 후부터 draw 메소드는 매 프레임마다 this.cur값을 1씩 늘려줌. 
      this.cur += 1;
      if (this.cur > 200) {
        // 그렇게 하다가 200이 넘는 순간(즉, 이미지 로드 후 200프레임이 지난 순간)
        // this.cur를 다시 0으로 초기화 해주고, Sheep 인스턴스를 생성하여 items에 담아놓는 addSheep 메소드를 실행함.
        this.cur = 0;
        this.addSheep();
      }

      // for loop를 this.items의 마지막 인덱스에 있는 요소부터 거꾸로 해주네... -> 가장 최근에 생성된 양부터 처리해주는 것 
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        // 여기서부터는 잘 모르겠음... 더 코드를 쳐봐야 알 듯.
        if (item.x < -item.width) {
          this.item.splice(i, 1);
        } else {
          item.draw(ctx, t, dots);
        }
      }
    }
  }
}