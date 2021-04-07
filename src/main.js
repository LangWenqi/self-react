
import { createElement, Component, render } from './selfreact';

class MyComponent extends Component {
  constructor () {
    super();
    this.state = {
      a: 1
    }
  }
  changeBC () {
    this.setState({
      a: this.state.a + 1
    })
  }
  render () {
    return (
      <div>
        <div>count: {this.state.a}</div>
        <button class={'btn'} onClick={() => this.changeBC()}>{this.state.a}</button>
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