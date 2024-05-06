# Guidelines for managing state in the Dexter App

### General code contribution guidelines

Please make sure to read the general guidelines for contributing to the project code [here](../../../CONTRIBUTING.md).

## Principles for managing state:

### Use Global State (Redux) only for state that needs to be used in multiple unrelated components or needs to be preserved when the component is deactivated.

Use component state for state that relates only to a component and its children.

### Use Redux only to _store_ and _manipulate_ global state.

Redux should be used to store and manipulate the global state. If data needs to be transformed for a specific component, do the transformation in the component. Avoid including any functions in state files that does not directly affect state. E.g. functions that create and submit Radix transactions should not be in state files.

### Organise data slices around related data

Try to group data into slices of data that are related. Bigger data slices are preferable to lots of small slices, so first see if there is an existing slice where data can be added before starting a new slice. Having fewer slices helps to prevent duplication of data.

At the same time, if a slice becomes too big and cumbersome, it might make sense to split out some subsection of the state into its own slice.

### Save all files related to a slice in a seperate folder

For each slice a seperate folder <slice_name> must be created in the 'state" folder. E.g. for the 'user' slice, a folder called .../state/user must be created. All files realted to that slice must be saved in this folder (see next principle).

### Follow a consistent state file naming convention

For each state slice, there should be a main file named `<slice_name>Slice.ts` e.g. userSlice.ts This file will contain the state definition, initial slice state, slice reducers, slice actions and slice selectors.

If the slice has Thunks, these functions must be in a sepeate file called `<slice_name>Thunks.ts` Thunks can be either synchronous or asynchronous.

If the slice has any functions that are required to make code in the previous 2 files more readable or more succint, then these functions must be placed in a separate file called `<slice_name>Utils.ts` The idea is to make the ...Slice and ...Thunks files as short and easy to read as possible, with long and complicated functions grouped in the ...Utils file. If it is required to have more than one ...Utils files for a slice, then keep the format of `<slice_name><description><Utils>.ts` for any extra files.

### Follow a consistent file structure for ...Slice files

The ...Slice file is the main file for any state slice and should provide an easy to understand interface of what fields and actions are available for a slice. To help facilitate this every ...Slice file must follow the following structure:

- Imports
- Declaration of any types and interfaces used in the slice
- An interface for the state stored in the slice named `<slice_name>State`
  ```
  export interface userState = {
    ...
  }
  ```
- The initial state of the slice stored in a constant called `initialState`
  ```
  const initialState: userState = {
    ...
  }
  ```
- The createSlice function for the slice called `<slice_name>Slice`
  ```
  export const unsrSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
      ...
    },
    extraReducers: (builder) => {
      ...
    }
  })
  ```
- an export of the available actions for the slice called ```<slice_name>Actions. The purpose of this export is to only expose the actions you want users to call (which might exclude certain reducers and/or thunks that should only be used by the slice internally).
  ```
  export const userActions = {
    ...
  }
  ```
- an export of any common selectors you want to make available for the slice

### When calling actions for a slice, only call actions that are exported by the slice.

As mentioned in the previous principle, every slice must explicitly export a set of actions that it wants to expose in the <slice_name>Actions constant. **Only the actions in this export should be used to change state in the slice**.

Do not use a direct reference to <slice_name>Slice.actions (which is automatically created by the `createSlice` function) to call an action.

Following this principle will ensure state is only changed in a way that is consistent with its design. E.g it might be that other state fields need to be updated when one field changes. This might not happen if you dont use the specificlly exported actions in <slice_name>Actions.

### Make API calls in seperate functions

Some thunks might involve API calls. Rather than have the API call logic in the thunk function, seperate the call out into another function that returns the results of the call or throws an error. The thunk can then just call the function to get the data or handle the error.

This ensures that thunks are easier to understand with only the main logic flow shown and all the specific details related to api calls dealt with in a seperate function.
