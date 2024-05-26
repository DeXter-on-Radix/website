# How to Use BoilerplateContext

We have three types of state management:

1. **Global State (Redux: `createSlice()`)**: Shared across the entire web app and multiple pages (e.g., trade history for "Trade" and "Rewards" pages).
2. **Page State (React: `useContext()`)**: Local state shared among components on a single page. This is managed by BoilerplateContext and does not persist across pages. Example: form inputs.
3. **Component State (React: `useState()`)**: For atomic components like buttons or headings that shouldn't depend on global or local state.

## Initializing Page State

Follow these steps to create a new Page State:

1. **Create Your Page**: For example, "MyPage" (`src/my-page/page.tsx`).
2. **Create Your Page Context**: (`src/my-page/MyPageContext.tsx`).
3. **Copy BoilerplateContext**: Copy content from [BoilerplateContext](./BoilerplateContext.tsx) to your context file and follow the instructions.
4. **Export Context**: Ensure `MyPageContext` exports `MyPageProvider` (to create the context) and `useMyPageContext` (to access state).
5. **Import Context**:

```tsx
import { useMyPageContext, MyPageProvider } from "./MyPageContext";
```

6. **Wrap Your Page Component**:

```jsx
export default function MyPage() {
  return <MyPageProvider>{/* YOUR COMPONENT CONTENT */}</MyPageProvider>;
}
```

7. **Use State in Components**:

```jsx
function MyPageChildComponent() {
  const {
    firstName: [firstName, setFirstName],
    lastName: [lastName, setLastName],
    age: [age, setAge],
  } = useMyPageContext();

  // Example usage showing how to get and set the state
  return (
    <div>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
    </div>
  );
}
```

8. **Accessing Only Values or Setters**:

```jsx
function MyPageChildComponent() {
  const {
    firstName: [firstName, setFirstName], // both value and setter needed
    lastName: [lastName], // only value needed
    age: [, setAge], // only setter needed
  } = useMyPageContext();

  return <></>;
}
```

## Questions?

For any questions, please ping @dcts.
