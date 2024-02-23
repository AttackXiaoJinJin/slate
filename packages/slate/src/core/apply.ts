import { PathRef } from '../interfaces/path-ref'
import { PointRef } from '../interfaces/point-ref'
import { RangeRef } from '../interfaces/range-ref'
import { FLUSHING } from '../utils/weak-maps'
import { Path } from '../interfaces/path'
import { Transforms } from '../interfaces/transforms'
import { WithEditorFirstArg } from '../utils/types'
import { Editor } from '../interfaces/editor'
import { isBatchingDirtyPaths } from './batch-dirty-paths'
import { updateDirtyPaths } from './update-dirty-paths'

export const apply: WithEditorFirstArg<Editor['apply']> = (editor, op) => {
  for (const ref of Editor.pathRefs(editor)) {
    PathRef.transform(ref, op)
  }

  for (const ref of Editor.pointRefs(editor)) {
    PointRef.transform(ref, op)
  }

  for (const ref of Editor.rangeRefs(editor)) {
    RangeRef.transform(ref, op)
  }

  // update dirty paths
  if (!isBatchingDirtyPaths(editor)) {
    const transform = Path.operationCanTransformPath(op)
      ? (p: Path) => Path.transform(p, op)
      : undefined
    console.log(editor.getDirtyPaths(op),'updateDirtyPaths30')
    updateDirtyPaths(editor, editor.getDirtyPaths(op), transform)
  }
  console.log(editor.children,'editor33')
  /* 根据用户输入更新slate value */
  Transforms.transform(editor, op)
  console.log(editor.children,'editor35')
  editor.operations.push(op)
  Editor.normalize(editor, {
    operation: op,
  })
  console.log(editor.children,'editor40')
  // Clear any formats applied to the cursor if the selection changes.
  if (op.type === 'set_selection') {
    editor.marks = null
  }

  if (!FLUSHING.get(editor)) {
    FLUSHING.set(editor, true)

    Promise.resolve().then(() => {
      console.log('promise微任务','apply49')
      FLUSHING.set(editor, false)
      editor.onChange({ operation: op })
      editor.operations = []
    })
  }
}
