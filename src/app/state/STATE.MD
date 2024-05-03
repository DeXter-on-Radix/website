# Guidelines for managing state in the Dexter App

### General code contribution guidelines

Please make sure to read the general guidelines for contributing to the project code [here](../../../CONTRIBUTING.md).

## Principles for managing state:

### Principle 1: Use Global State (Redux) only for state that needs to be used in multiple unrelated components or needs to be preserved when the component is deactivated. Use component state for state that relates only to a component and its children.

### Principle 2: Use Redux only to store and manipulate global state.

Redux should be used to store and manipulate the global state. If data needs to be transformed for a specific component, do the transformation in the component

### Principle 3: Organise data slices around related data

Try to group data into slices of data that are related. Bigger data slices are preferable to lots of small slices, so first see if there is an existing slice where data can be added before starting a new slice. Having fewer slices also helps to prevent duplication of data.
