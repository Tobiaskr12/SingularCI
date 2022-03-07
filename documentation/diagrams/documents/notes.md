# DSL Example

Stage - Name "Build"
Job - Name "1st Job"

Stage("Build")
Job("Job1")
Task()

# DSL Book chapters

- 11: Semantic model
- 12: Symbol table
- 13: Context Variable
- 14: Construction builder
- 23: Parser generator
- 24: Tree construction
- Part 6: Code generation


# Remember
- we're not creating custom containers the pipelines can run in, since it would require self-hosted runners. This adds complexity which conflicts with the risk of SingularCI being harder to use than existing platforms