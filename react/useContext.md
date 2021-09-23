# useContext
### 1. simple example (just value)
```js
//userCntext.js
import {createContext} from 'react';

export const UserContext = createContext(null);

//App.js
import {UserContext} from './UserContext';

return(
  <UserContext.Provider value='some Context'>
    <Route path='/' exact component={Index} />
    <Route path='/about/' component={About} />
  </UserContext.Provider>
)

//Index.js
import React, {useContext} from 'react';

export function Index() {
  const msg = useContext(UserContext);

  return(
    <div>
      <div>{msg}</div>  //some Context
    </div>
  )  
}

```

### 2. {value, setValue}, useMemo

```js
//App.js
const providerValue = useMemo(() => ({value, setValue}), [value, setValue]);

return(
  <UserContext.Provider value={providerValue}>
    <Route path='/' exact component={Index} />
    <Route path='/about/' component={About} />
  </UserContext.Provider>
)

//Index.js
const {value, setValue} = useContext(UserContext);

return (
  <button onClick={() => setValue('changed Value')}>
)
```

### 참고
- React Hooks useContext Tutorial (https://www.youtube.com/watch?v=lhMKvyLRWo0)
- Learn useContext In 13 Minutes (https://www.youtube.com/watch?v=5LrDIWkK_Bc)



- https://fatmali.medium.com/use-context-and-custom-hooks-to-share-user-state-across-your-react-app-ad7476baaf32