export default class Transition {
  constructor(config = {}) {
    this.duration = config.duration ? config.duration : 0.5;
    this.finished = false;
    this.start = -1;
    this.from_ = 0;
    this.to_ = 0;
    this.delta = 0;
    this.current = 0;
    this.callback = config.callback ? config.callback : this.callback_;
    this.onFinish = config.onFinish || (() => {});
    this.onStart = config.onStart || (() => {});
    this.curve = config.curve || 'linear';

    // make this context self contained when called from event handlers
    this.update = this._update.bind(this);
  }

  callback_(current) {
    console.log(`transition without update initialized, current interpolation is ${current}`);
  }

  forward(from = 0) {
    this.from_ = Math.min(1, Math.max(from, 0));
    this.to_ = 1;
    this.finished = false;
    this.onStart(this.current);
  }

  reverse(from = 1) {
    this.from_ = Math.min(1, Math.max(from, 0));;
    this.to_ = 0;
    this.finished = false;
    this.onStart(this.current);
  }

  _update(data) {
    if (this.finished === true || this.from_ === this.to_) {
      return;
    }

    if (this.start < 0) {
      this.start = data.elapsedTime;
    }

    this.delta = Math.min((data.elapsedTime - this.start) / this.duration, 1.0);
      //linear
      //const curved = delta;

      //easeOutQuad
    const curved = this.curve === 'linear' ? this.delta : 1.0 - ( 1.0 - this.delta ) * ( 1.0 - this.delta );

    //easeOutElastice
      //const c4 = ( 2 * Math.PI ) / 3;
      //const curved = delta === 0 ? 0 : delta === 1 ? 1 : Math.pow( 2, -10 * delta ) * Math.sin( ( delta * 10 - 0.75 ) * c4 ) + 1;

    this.current = (1.0 - curved) * this.from_ + curved * this.to_;

    this.callback(this.current);

    if (this.delta >= 1.0) {
      this.finished = true;
      this.start = -1;
      // for final renders to finish wait for next cycle
      setTimeout(() => this.onFinish(this.current), 0);
    }
  }

  teardown() {
    this.finished = true;
    this.start = -1;
    this.onFinish(this.current);
  }
}
