import { Router } from 'https://deno.land/x/oak/mod.ts';
import { ObjectId } from "https://deno.land/x/mongo@v0.13.0/mod.ts";

import { getDb  } from '../helpers/db_client.ts';

const router = new Router();

interface Todo {
  id?: string;
  text: string;
}

interface TodoSchema {
  _id: { $oid: string };
  text: string;
}

router.get('/todos', async(ctx) => {
  const todos = await getDb().collection('todos').find();// {_id: ObjectId(), text: ...}
  console.log('get/todos', Array.isArray(todos));
  console.log(todos);
  if(todos.length == 0){
    ctx.response.body = { todos: todos };
  }

  // const transformedTodos = todos.map((item: {_id: ObjectId, text: string}) => {
  const transformedTodos = todos.map((item: any) => {
    return { id: item._id.$oid, text: item.text }
  });

  ctx.response.body = { todos: transformedTodos };
});

router.post('/todos', async (ctx) => {
  const { value } =  ctx.request.body({type: 'json'});
  const { text } = await value;
  const newTodo: Todo = {
    text: text,
  };

  const id = await getDb().collection('todos').insertOne(newTodo);
  newTodo.id = id.$oid;
  ctx.response.body = { message: 'Created todo!', todo: newTodo };
});

router.put('/todos/:todoId', async (ctx) => {
  const tid = ctx.params.todoId!;
  const { value } = ctx.request.body({type: 'json'});
  const { text } = await value;
  let todo = await getDb().collection('todos').findOne({_id: {$oid: tid}});
  if (todo === null){
    ctx.response.body = { message: 'Todo not found!!'};
    return;
  }

  const {matchedCount, modifiedCount, upsertedId} = await getDb().collection('todos').updateOne(
    {_id: {$oid: tid}},
    {$set: { text: text }}
  );
  if(matchedCount === 1 && modifiedCount === 1){
    ctx.response.body = { message: 'Updated todo', todo: {id: tid, text: text} };
    return;
  }
  ctx.response.body = { message: 'Update todos failed', todo: todo };
});

router.delete('/todos/:todoId', async (ctx) => {
  const tid = ctx.params.todoId!;
  let todo = await getDb().collection('todos').findOne({_id: ObjectId(tid)});
  if (todo === null){
    ctx.response.body = { message: 'Todo not found!!'};
    return;
  }
  const deleteCount = await getDb().collection('todos').deleteOne({ _id: {$oid: tid} });
  console.log(deleteCount);
  if(deleteCount === 1){
    ctx.response.body = { message: 'Deleted todo' };
    return;
  }
  ctx.response.body = { message: 'Deleting todo failed' };
});

export default router;
