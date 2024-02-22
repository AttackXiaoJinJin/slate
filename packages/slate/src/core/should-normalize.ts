import { WithEditorFirstArg } from '../utils/types'
import { Editor } from '../interfaces/editor'

export const shouldNormalize: WithEditorFirstArg<Editor['shouldNormalize']> = (
  editor,
  { iteration, initialDirtyPathsLength }
) => {
  // 限制最大normalize次数，防止无限循环
  const maxIterations = initialDirtyPathsLength * 42 // HACK: better way?

  if (iteration > maxIterations) {
    throw new Error(
      `Could not completely normalize the editor after ${maxIterations} iterations! This is usually due to incorrect normalization logic that leaves a node in an invalid state.`
    )
  }

  return true
}
