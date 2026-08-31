import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bold: {
      toggleBold: () => ReturnType,
    }
    italic: {
      toggleItalic: () => ReturnType,
    }
    heading: {
      toggleHeading: (attributes: { level: number }) => ReturnType,
    }
    bulletList: {
      toggleBulletList: () => ReturnType,
    }
    orderedList: {
      toggleOrderedList: () => ReturnType,
    }
    history: {
      undo: () => ReturnType,
      redo: () => ReturnType,
    }
  }
}