import { useState } from "react"
import { useQuery, gql, useMutation } from '@apollo/client';

const GET_TODOS = gql`
  query getTodos {
      todos {
        done
        id
        text
      }
  }
`

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean) {
  update_todos(_set: {done: $done}, where: {id: {_eq: $id}}) {
    returning {
      done
      id
      text
    }
  }
}`

const ADD_TODO = gql`
  mutation addTodo($text: String!) {
  insert_todos(objects: {text: $text}) {
    returning {
      done
      id
      text
    }
  }
}`

const DELETE_TODO = gql`
 mutation deleteTodo($id: uuid!) {
  delete_todos(where: {id: {_eq: $id}}) {
    returning {
      id
      done
      text
    }
  }
}`

function App() {
  const [inputChangeState, setInputChangeState] = useState('')
  const { data, loading, error } = useQuery(GET_TODOS)
  const [toggleTodo] = useMutation(TOGGLE_TODO)
  const [addTodo] = useMutation(ADD_TODO, { onCompleted: () => setInputChangeState('') })
  const [deleteTodo] = useMutation(DELETE_TODO)

  if (loading) return <div>Loading ... Please wait</div>
  if (error) return <div>Error loading data</div>

  const toggleTodoHandler = async ({ id, done }) => {
    const data = await toggleTodo({ variables: { id: id, done: !done } })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    if (!inputChangeState.trim()) return;
    const data = await addTodo({ variables: { text: inputChangeState }, refetchQueries: [{ query: GET_TODOS }] })

  }

  const complexClassFunc = (done) => {
    return done ? "strike" : null
  }

  const inputHandler = (e) => {
    setInputChangeState(e.target.value)
  }

  const deleteHandler = async (id) => {
    const data = await deleteTodo({
      variables: { id: id },
      update: cache => {
        // give me what's in the cache:
        const prevData = cache.readQuery({ query: GET_TODOS })
        const newTodos = prevData.todos.filter(e => e.id !== id)
        cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } })
      }
    })
  }

  return (
    <center>
      <h1>GraphQL</h1>

      <form onSubmit={(e) => submitHandler(e)}>
        <input type="text" placeholder="+Add ToDo" name="input" onChange={inputHandler} value={inputChangeState} />
        <button type="submit" children="Create" />
      </form>

      <div>
        {data.todos.map(each => {
          return (
            <div key={`each.text ${Math.random() * 1000}`} onDoubleClick={() => toggleTodoHandler(each)} >
              <span className={complexClassFunc(each.done)} data-done={each.done} >{each.text}</span>
              <button onClick={() => deleteHandler(each.id)} >&times;</button>
            </div>)
        })}
      </div>
    </center>
  );
}

export default App;
