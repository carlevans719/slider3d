;'use strict'

window.Slider3D = class Slider3D {

	constructor(elem) {
		if (!this.isElement(elem)) throw new Error('Invalid element supplied');
		this.element = elem;
		this.addListeners();

		this.currentTile = 0;
		this.rotation = 0;
		this.tiles = this.element.children;
		this.tileCount = () => this.tiles.length;
		this.theta = 0;

		this.mouseXPos = 0;
		this.isMouseDown = false;

		this.oldTransformSymbol = Symbol('oldTransform');


		this.modify();
	}

	isElement(something) {
		return !!(something && something.nodeType === 1);
	}

	addListeners() {
		this.boundModifyFunc = this.modify.bind(this);
		this.boundOnMouseDownFunc = this.onMouseDown.bind(this);
		this.boundOnMouseMoveFunc = this.onMouseMove.bind(this);
		this.boundOnMouseUpFunc = this.onMouseUp.bind(this);
		this.element.addEventListener('DOMNodeInserted', this.boundModifyFunc);
		this.element.addEventListener('DOMNodeRemoved', this.boundModifyFunc);
		this.element.addEventListener('mousedown', this.boundOnMouseDownFunc);
		this.element.addEventListener('mousemove', this.boundOnMouseMoveFunc);
		this.element.addEventListener('mouseup', this.boundOnMouseUpFunc);
	}

	removeListeners() {
		this.element.removeEventListener('DOMNodeInserted', this.boundModifyFunc);
		this.element.removeEventListener('DOMNodeRemoved', this.boundModifyFunc);
		this.element.removeEventListener('mousedown', this.boundOnMouseDownFunc);
		this.element.removeEventListener('mousemove', this.boundOnMouseMoveFunc);
		this.element.removeEventListener('mouseup', this.boundOnMouseUpFunc);
	}

	restoreOriginalCSS() {
		for (let idx = 0, count = this.tileCount(); idx < count; idx++) {
			let tile = this.tiles[idx];
			tile.style.transform = tile[this.oldTransformSymbol];
		}
		this.element.style.transform = this.element[this.oldTransformSymbol];
	}

	destroy() {
		this.removeListeners();
		this.restoreOriginalCSS();
	}

	onMouseDown(e) {
		this.isMouseDown = true;
		this.mouseXPos = e.pageX;
	}

	onMouseMove(e) {
		console.log("e.pageX");
	  if (this.isMouseDown) {
	    this.rotation -= (this.mouseXPos - e.pageX);
			this.mouseXPos = e.pageX;
			this.transform();
	  }
	}

	onMouseUp() {
		this.isMouseDown = false;
	}

	previousTile() {
		this.currentTile = this.currentTile === 0 ? this.tileCount() - 1 : this.currentTile - 1;
		this.rotation += this.theta;
		this.transform();
	}

	nextTile() {
		this.currentTile = this.currentTile === this.tileCount() + 1 ? 0 : this.currentTile + 1;
		this.rotation -= this.theta;
		this.transform();
	}

	slideTo(target, direction) {
		let distanceToTarget = target - this.currentTile;
		if (!direction && distanceToTarget > 0) direction = 'forward';
		if (!direction && distanceToTarget < 0) direction = 'backward';

		if (direction === 'forward') {
			if (distanceToTarget > 0) {
				this.rotation -= this.theta * distanceToTarget;
			} else if (distanceToTarget < 0) {
				this.rotation -= this.theta * ( (this.tileCount() - this.currentTile) + target);
			}
		} else if (direction === 'backward') {
			if (distanceToTarget < 0) {
				this.rotation -= this.theta * distanceToTarget;
			} else if (distanceToTarget > 0) {
				this.rotation += this.theta * ( this.currentTile + (this.tileCount() + target) );
			}
		}

		this.currentTile = target;
		this.transform();
	}

	modify() {
		this.tileSize = this.element.offsetWidth;
		this.theta = 360 / this.tileCount();

		this.radius = Math.round( (this.tileSize/2) / Math.tan(Math.PI/this.tileCount()) );

		for (let idx = 0, count = this.tileCount(); idx < count; idx++) {
			let tile = this.tiles[idx],
				angle = this.theta * idx;

			if (!tile[this.oldTransformSymbol]) tile[this.oldTransformSymbol] = tile.style.transform;
			tile.style.transform = `rotateY(${angle}deg) translateZ(${this.radius}px)`;
		}

		this.rotation = Math.round( this.rotation / this.theta ) * this.theta;

		this.transform();
	}

	transform() {
		if (!this.element[this.oldTransformSymbol]) this.element[this.oldTransformSymbol] = this.element.style.transform;
		this.element.style.transform = `translateZ(-${this.radius}px) rotateY(${this.rotation}deg)`;
	}
};
