'use strict';

const Rue = function (options) {
	this.elem = document.querySelector(options.selector);
	this.data = options.data;
	this.template = options.template;
};

const data = {
	heading: 'My Todos',
	todos: ['Swim', 'Climb', 'Jump', 'Play'],
};

//just state
/* let template = function (props) {
	return `
		<h1>${props.heading}</h1>
		<ul>
			${props.todos.map(todo => {
				return `<li>${todo}</li>`;
			}).join('')}
		</ul>`;
}; */

const app = new Rue({
	selector: '#app',
	data: data,
	template: function (props) {
		return `
      <h1>${props.heading}</h1>
      <ul>
        ${props.todos
					.map((todo) => {
						return `<li>${todo}</li>`;
					})
					.join('')}
        </ul>`;
	}
});

const bpp = new Rue({
	selector: '#app',
	data: data,
	template: function (props) {
    let list = [];
		return `
      <h1>${props.heading}</h1>
      <ul>${props.todos.map((todo) => {
        debugger;
            list += `<li>${todo}</li>`;
					})
        }
        ${list}
        </ul>`;
	}
});


Rue.prototype.render = function () {
	this.elem.innerHTML = this.template(this.data);
  console.log(this.template(this.data))
};

app.data.todos.push('Take a nap... zzzzz');
//app.render();

bpp.render();

/* 참고 : https://gomakethings.com/how-to-create-a-state-based-ui-component-with-vanilla-js/ */
//https://jungpaeng.tistory.com/90
