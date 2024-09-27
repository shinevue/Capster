import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { someAction } from '@/store/exampleSlice';

export function useExample() {
  const exampleState = useSelector((state: RootState) => state.example);
  const dispatch = useDispatch<AppDispatch>();

  const doSomething = () => {
    dispatch(someAction());
  };

  return { exampleState, doSomething };
}