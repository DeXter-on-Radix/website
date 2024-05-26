# How to use BoilerplateContext

As a reminder: we plan on having 3 different types of state:

- **Global State (Redux: `createSlice()`)**: state that is potentially shared among the full webapp and among muliple pages (e.g. trade history is needed to display past trades inside "Trade" page but also to compute rewards inside "Rewards", hence should be global)
- **Page State (React: `useContext()`)**: page wide local state that can be shared among different components on a single page. BoilerplateContext is exactly this, a page wide state store that is shared among different components of a given page, but does not pervail when switching to another page. Example use cases: form inputs.
- **Component State (React: `useState()`)**: if we have atomic components (reusable UI components like buttons or headings etc), those should not depend on either global nor local page wide state.

To initialize a new Page State follow this guide:

1. Create your page, e.g. "MyPage" (create `src/my-page/page.tsx`)
2. Create your page context `src/my-page/MyPageContext.tsx`
3. Copy the content of [BoilerplateContext](./BoilerplateContext.tsx) into your context file, and follow its instructions
4. You now should have 2 exports from MyPageContext: `useMyPage` and `MyPageProvider`.
5. Import those inside `src/my-page/page.tsx`:

```tsx
import { useMyPage, MyPageProvider } from "./MyPageContext";
```

6. Then wrap your page-wide component inside `MyPageProvider` like this:

```jsx
export default function MyPage() {
  return <MyPageProvider>{/* YOUR COMPONENT CONTENT */}</MyPageProvider>;
}
```

7. Whenever you need the state or update the state, use can import it like this:

```jsx
function MyPageChildComponent() {
  const {
    ["firstName"]: [firstName, setFirstName],
    ["lastName"]: [lastName, setLastName],
    ["age"]: [age, setAge],
  } = useProvideLiquidity();

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

8. If you need only the value, or only the setter, you can use this pattern:

```jsx
function MyPageChildComponent() {
  const {
    ["firstName"]: [firstName, setFirstName], // both value and setter needed
    ["lastName"]: [lastName], // only value needed
    ["age"]: [, setAge], // only setter needed
  } = useProvideLiquidity();
  // ...
  return <></>;
}
```

## For any questions, please ping @dcts
