
import { createElement, Component, render } from './selfreact';

class MyComponent extends Component {
  render () {
    return (
      <div>
        {(function(){return '1'})()}
        {this.children}
      </div>
    )
  }
}

class MyChildComponent extends Component {
  render () {
    return (
      <div>
        childparent
        {this.children}
      </div>
    )
  }
}

render(<MyComponent class='testclass' id='testid'>
  <div>{{root:1}}</div>
  <div>test</div>
  <MyChildComponent>
    <div>child</div>
  </MyChildComponent>
</MyComponent>, document.getElementById('root'))