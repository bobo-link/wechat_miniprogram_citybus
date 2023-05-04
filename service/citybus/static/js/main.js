/**
 * demo1.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
// import { feedback_info } from "./util";
{
	const config = {
		uldor: {
			in: {
				base: {
					duration: 400,
					easing: 'easeOutExpo',
					scale: [0.5, 1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				path: {
					duration: 900,
					easing: 'easeOutElastic',
					d: 'M 33.5,31 C 33.5,31 145,31 200,31 256,31 367,31 367,31 367,31 367,110 367,150 367,190 367,269 367,269 367,269 256,269 200,269 145,269 33.5,269 33.5,269 33.5,269 33.5,190 33.5,150 33.5,110 33.5,31 33.5,31 Z'
				},
				content: {
					duration: 900,
					easing: 'easeOutElastic',
					delay: 100,
					scale: [0.8, 1],
					opacity: {
						value: 1,
						easing: 'linear',
						duration: 100
					}
				},
				trigger: {
					translateY: [
						{ value: '-50%', duration: 100, easing: 'easeInQuad' },
						{ value: ['50%', '0%'], duration: 100, easing: 'easeOutQuad' }
					],
					opacity: [
						{ value: 0, duration: 100, easing: 'easeInQuad' },
						{ value: 1, duration: 100, easing: 'easeOutQuad' }
					],
					color: {
						value: '#6fbb95',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			},
			out: {
				base: {
					duration: 200,
					easing: 'easeInExpo',
					scale: 0.5,
					opacity: {
						value: 0,
						duration: 75,
						easing: 'linear'
					}
				},
				path: {
					duration: 200,
					easing: 'easeOutQuint',
					d: 'M 79.5,66 C 79.5,66 128,106 202,105 276,104 321,66 321,66 321,66 287,84 288,155 289,226 318,232 318,232 318,232 258,198 200,198 142,198 80.5,230 80.5,230 80.5,230 112,222 111,152 110,82 79.5,66 79.5,66 Z'
				},
				content: {
					duration: 100,
					easing: 'easeOutQuint',
					scale: 0.8,
					opacity: {
						value: 0,
						duration: 50,
						easing: 'linear'
					}
				},
				trigger: {
					translateY: [
						{ value: '50%', duration: 100, easing: 'easeInQuad' },
						{ value: ['-50%', '0%'], duration: 100, easing: 'easeOutQuad' }
					],
					opacity: [
						{ value: 0, duration: 100, easing: 'easeInQuad' },
						{ value: 1, duration: 100, easing: 'easeOutQuad' }
					],
					color: {
						value: '#666',
						duration: 1,
						delay: 100,
						easing: 'easeOutQuad'
					}
				}
			}
		},
	};

	const tooltips = Array.from(document.querySelectorAll('.tooltip'));

	class Tooltip {
		constructor(el) {
			this.DOM = {};
			this.DOM.el = el;
			this.type = this.DOM.el.getAttribute('data-type');
			this.DOM.trigger = this.DOM.el.querySelector('.tooltip__trigger');
			this.DOM.triggerSpan = this.DOM.el.querySelector('.tooltip__trigger-text');
			this.DOM.base = this.DOM.el.querySelector('.tooltip__base');
			this.DOM.shape = this.DOM.base.querySelector('.tooltip__shape');
			if (this.DOM.shape) {
				this.DOM.path = this.DOM.shape.childElementCount > 1 ? Array.from(this.DOM.shape.querySelectorAll('path')) : this.DOM.shape.querySelector('path');
			}
			this.DOM.deco = this.DOM.base.querySelector('.tooltip__deco');
			this.DOM.content = this.DOM.base.querySelector('.tooltip__content');

			this.DOM.letters = this.DOM.content.querySelector('.tooltip__letters');
			if (this.DOM.letters) {
				// Create spans for each letter.
				charming(this.DOM.letters);
				// Redefine content.
				this.DOM.content = this.DOM.letters.querySelectorAll('span');
			}
			this.initEvents();
		}
		initEvents() {
			this.mouseenterFn = () => {
				this.mouseTimeout = setTimeout(() => {
					this.isShown = true;
					this.show();
				}, 75);
			}
			this.mouseleaveFn = () => {
				clearTimeout(this.mouseTimeout);
				if (this.isShown) {
					this.isShown = false;
					this.hide();
				}
			}
			this.DOM.trigger.addEventListener('mouseenter', this.mouseenterFn);
			this.DOM.trigger.addEventListener('mouseleave', this.mouseleaveFn);
			this.DOM.trigger.addEventListener('touchstart', this.mouseenterFn);
			this.DOM.trigger.addEventListener('touchend', this.mouseleaveFn);
		}
		show() {
			this.animate('in');
		}
		hide() {
			this.animate('out');
		}
		animate(dir) {
			if (config[this.type][dir].base) {
				anime.remove(this.DOM.base);
				let baseAnimOpts = { targets: this.DOM.base };
				anime(Object.assign(baseAnimOpts, config[this.type][dir].base));
			}
			if (config[this.type][dir].shape) {
				anime.remove(this.DOM.shape);
				let shapeAnimOpts = { targets: this.DOM.shape };
				anime(Object.assign(shapeAnimOpts, config[this.type][dir].shape));
			}
			if (config[this.type][dir].path) {
				anime.remove(this.DOM.path);
				let shapeAnimOpts = { targets: this.DOM.path };
				anime(Object.assign(shapeAnimOpts, config[this.type][dir].path));
			}
			if (config[this.type][dir].content) {
				anime.remove(this.DOM.content);
				let contentAnimOpts = { targets: this.DOM.content };
				anime(Object.assign(contentAnimOpts, config[this.type][dir].content));
			}
			if (config[this.type][dir].trigger) {
				anime.remove(this.DOM.triggerSpan);
				let triggerAnimOpts = { targets: this.DOM.triggerSpan };
				anime(Object.assign(triggerAnimOpts, config[this.type][dir].trigger));
			}
			if (config[this.type][dir].deco) {
				anime.remove(this.DOM.deco);
				let decoAnimOpts = { targets: this.DOM.deco };
				anime(Object.assign(decoAnimOpts, config[this.type][dir].deco));
			}
		}
		destroy() {
			this.DOM.trigger.removeEventListener('mouseenter', this.mouseenterFn);
			this.DOM.trigger.removeEventListener('mouseleave', this.mouseleaveFn);
			this.DOM.trigger.removeEventListener('touchstart', this.mouseenterFn);
			this.DOM.trigger.removeEventListener('touchend', this.mouseleaveFn);
		}
	}
	const content_text_format = function(str){
		if (str.length > 150){
			return str.substr(0,150) + '...'
		}
		return str
	}
	const showContent = function showContent(grid, dict) {
		var temp, item, a, i;
		temp = $("template")[0];
		Object.entries(dict).forEach(item => {
			temp.setAttribute('data-openid', item.openid)
			let nickname = temp.content.querySelector(".tooltip")
			nickname.setAttribute('data-openid', item[0])
			$(temp.content).find('.tooltip').attr('data-index', 0) 
			let direction_symbol = temp.content.querySelectorAll(".direction_symbol")

			Array.from(direction_symbol).forEach((value, index) => {				
				if (index) {
					value.setAttribute('data-action', 'up')
				} else {
					value.setAttribute('data-action', 'down')
				}
				direction_symbol_status(value, 0, item[1].content_length)
			})
			let content = temp.content.querySelector(".tooltip__content")
			content.textContent = content_text_format(item[1].content.text)
			$(temp.content).find(".tooltip__trigger-text").text(item[1].nickname) 
			let clon = temp.content.cloneNode(true);
			grid.append(clon);

			// 点击事件监听
			grid.children().eq(-1).on("click", ".direction_symbol", e => {
				const action_config = {
					'up': index => {
						return ++index
					},
					'down': index => {
						return --index
						
					}
				}
				// 发起网络请求，获取当前下标的content内容
				let dataset = $(e.currentTarget).parent()[0].dataset
				let current_index = action_config[e.currentTarget.dataset.action](dataset.index)
				let feedback = feedback_info(dataset.openid,current_index)[0]
				// 改变content框内容
				$(e.currentTarget).parent().find('.tooltip__content').text(content_text_format(feedback.content.text))
				// 改变按钮样式
				Array.from($(e.currentTarget).parent().find('.direction_symbol')).forEach(item => {
					direction_symbol_status(item, current_index, feedback.content_length)
				})

			})
			grid.on("click", ".tooltip__base", e => {
				let dataset = $(e.currentTarget).parent().data()
				location.href='reply.html?' + 'openid=' + dataset.openid + '&index=' + dataset.index

			})
		})

	}
	const direction_symbol_status = (symbol, index, length) => {
		let symbol_class = symbol.getAttribute('class').split(' ')
		$(symbol).parent().attr('data-index', index)
		if (symbol_class.indexOf('left_symbol') != -1) {
			if (index == 0) {
				$(symbol).addClass('disable')
			} else {
				$(symbol).removeClass('disable')
			}
		}
		if (symbol_class.indexOf('right_symbol') != -1) {
			if (index == length - 1) {
				$(symbol).addClass('disable')
			} else {
				$(symbol).removeClass('disable')
			}
		}
	}
	// const init = (() => tooltips.forEach(t => new Tooltip(t)))();
	

	let grid = $(".grid")
	showContent(grid, feedback_info('all'))
	
	

};