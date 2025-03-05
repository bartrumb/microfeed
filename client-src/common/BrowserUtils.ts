/**
 * Put it in componentDidMount()
 * @param hasChanged - Function that returns true if there are unsaved changes
 */
export function preventCloseWhenChanged(hasChanged: () => boolean): void {
  window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
    if (hasChanged()) {
      e.preventDefault();
      e.returnValue = '';
      return;
    }

    delete e['returnValue'];
  });
}