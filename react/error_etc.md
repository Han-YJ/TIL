## Draggable 
❓findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of DraggableCore which is inside StrictMode
❗useRef로 연결해서 해결
```js
function MyComponent() {
    const nodeRef = React.useRef(null);
    return (
        <Draggable nodeRef={nodeRef}>
            <div ref={nodeRef}>Example Target</div>
        </Draggable>
    );
}
```