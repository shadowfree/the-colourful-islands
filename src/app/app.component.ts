import { Component, OnInit, ViewChild } from '@angular/core';
import {e} from '@angular/core/src/render3';

const SIZE = 50;
const SEA_LAND_RATIO = 40;

enum AreaStatus {
  Sea = 0,
  Land = 1,
  Discovered = 2,
}

const SEA_COLOR = '#cbe1ff';
const LAND_COLOR = '#bbbbbb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public title = 'The Island Discovery';
  public canvasWidth = 800;
  public canvasHeight = 800;
  public island: number[] = new Array(SIZE * SIZE);
  public color: string[] = new Array(SIZE * SIZE);
  public newColor = '#00FF00';
  public timeGeneration = 0;
  public numberOfIslands = 0;

  @ViewChild('canvasElement')
  public canvasEl;

  @ViewChild('inputElement')
  public inputEl;

  private position;

  public ngOnInit() {
    this.generate();

    const start = performance.now();
    this.countIslands();
    const end = performance.now();
    this.timeGeneration = Math.floor((end - start) * 100) / 100;
    this.render();
  }

  public onColorChanged(event: Event) {
    const regexHexaColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g;
    const value = (<HTMLInputElement>event.target).value;

    if ( value.match(regexHexaColor)) {
      if ( this.position === undefined ) {
        this.newColor = value;
        this.island.map((element, index) => {
          this.color[index] = (element !== 0 ? this.newColor : SEA_COLOR);
        });
      } else {

        if (this.getValueAt(this.position.row, this.position.col) === AreaStatus.Discovered) {
          this.findIsland(this.position.row, this.position.col, value);
        }
      }
      // redraw canvas
      this.render();
    }
  }

  private getInitialColor(value: number): string {
    if (value === AreaStatus.Land) {
      return LAND_COLOR;
    }
    return SEA_COLOR;
  }

  private setValueAt(row: number, column: number, value: number) {
    this.island[row * SIZE + column] = value;
  }

  private getValueAt(row: number, column: number): number {
    return this.island[row * SIZE + column];
  }

  private setIslandColor(row: number, column: number, value: string) {
    this.color[row * SIZE + column] = value;
  }

  private getIslandColor(row: number, column: number): string {
    return this.color[row * SIZE + column];
  }

  /**
   * generate new island
   */
  private generate() {
    let state, color;
    for (let col = 0; col < SIZE; col++) {
      for (let row = 0; row < SIZE; row++) {
        state = Math.round(Math.random() * 100);
        const area = state >= SEA_LAND_RATIO ? AreaStatus.Sea : AreaStatus.Land;
        color = this.getInitialColor(area);

        this.setValueAt(row, col, area);
        this.setIslandColor(row, col, color);
      }
    }
  }

  /**
   * render the island into the canvas Element
   */
  private render() {
    const canvas = this.canvasEl.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    const ctx = canvas.getContext('2d');

    const squareWidth = Math.floor(canvas.width / SIZE);
    const squareHeight = Math.floor(canvas.height / SIZE);

    let x, y;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        ctx.fillStyle = this.getIslandColor(row, col);
        y = row * squareHeight;
        x = col * squareWidth;
        ctx.fillRect(x, y, squareWidth, squareHeight);
        ctx.fillStyle = '#000';
      }
    }
    this.attachEventListeners(canvas);
  }

  /**
   * generate random color
   * @return {string}
   */
  private generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    const color = ['#'];
    for (let i = 0; i < 6; i++) {
      color.push(letters[Math.floor(Math.random() * 16)]);
    }
    return color.join('');
  }

  /**
   * count islands
   * @return {number}
   */
  private countIslands() {
    for (let col = 0; col < SIZE; col++) {
      for (let row = 0; row < SIZE; row++) {
        if (this.getValueAt(row, col) === AreaStatus.Land) {
          this.numberOfIslands++;
          this.findIslands(row, col, this.generateRandomColor());
        }
      }
    }

    return this.numberOfIslands;
  }

  /**
   * attach event listeners
   */
  private attachEventListeners(canvas: any) {
    const that = this;
    canvas.addEventListener('click', (event) => {
      let x, y;

      if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
      } else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      x -= canvas.offsetLeft + canvas.clientLeft;
      y -= canvas.offsetTop + canvas.clientTop;

      const squareWidth = Math.floor(canvas.width / SIZE);
      const squareHeight = Math.floor(canvas.height / SIZE);

      const row = Math.floor(y / squareWidth);
      const col = Math.floor(x / squareHeight);

      that.position = { row, col };
    });
  }

  /**
   * discover island and apply a new color.
   * the definition of an Island is : All LAND square that connect to an other LAND square
   */
  private findIsland(row: number, col: number, color: string) {
    // Fast exit - Bounds
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE ) {
      return;
    }

    // Fast exit - Status
    if ( this.getValueAt(row, col) === AreaStatus.Sea || this.getIslandColor(row, col) === color) {
      return;
    }

    this.setIslandColor(row, col, color);

    // All connections possible
    this.findIsland(row - 1, col - 1, color);
    this.findIsland(row - 1, col, color);
    this.findIsland(row - 1, col + 1, color);
    this.findIsland(row, col - 1, color);
    this.findIsland(row, col + 1, color);
    this.findIsland(row + 1, col - 1, color);
    this.findIsland(row + 1, col, color);
    this.findIsland(row + 1, col + 1, color);
  }


    /**
   * discover islands and apply a new color to each of them.
   * the definition of an Island is : All LAND square that connect to an other LAND square
   */
  private findIslands(row: number, col: number, color: string) {

    // Fast exit - Bounds
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE ) {
      return;
    }

    // Fast exit - Status
    if ( this.getValueAt(row, col) === AreaStatus.Sea || this.getValueAt(row, col) === AreaStatus.Discovered) {
      return;
    }

    this.setIslandColor(row, col, color);
    this.setValueAt(row, col, AreaStatus.Discovered);

    // All connections possible
    this.findIslands(row - 1, col - 1, color);
    this.findIslands(row - 1, col, color);
    this.findIslands(row - 1, col + 1, color);
    this.findIslands(row, col - 1, color);
    this.findIslands(row, col + 1, color);
    this.findIslands(row + 1, col - 1, color);
    this.findIslands(row + 1, col, color);
    this.findIslands(row + 1, col + 1, color);
  }
}
