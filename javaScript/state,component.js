'use strict'

const Rue = function(options) {
  this.elem = document.querySelector(options.selector);
  this.data = options.data;
  this.template = options.template;
}

const data = {
	heading: 'My Todos',
	todos: ['Swim', 'Climb', 'Jump', 'Play']
};

/* let template = function (props) {
	return `
		<h1>${props.heading}</h1>
		<ul>
			${props.todos.map(todo => {
				return `<li>${todo}</li>`;
			}).join('')}
		</ul>`;
}; */


const app = new Rue(
  {
    selector: '#app',
    data: data,
  template: function(props) {
    return `
      <h1>${props.heading}</h1>
      <ul>
        ${props.todos.map(todo => {return `<li>${todo}</li>`}).join('')}
        </ul>`;
  }
  }); 

Rue.prototype.render = function () {
	this.elem.innerHTML = this.template(this.data);
};

app.data.todos.push('Take a nap... zzzzz');
app.render();

/* 참고 : https://gomakethings.com/how-to-create-a-state-based-ui-component-with-vanilla-js/ */