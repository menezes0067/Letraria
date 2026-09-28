export interface ICommand<Input = unknown, Output = unknown> {
	execute(input: Input): Output;
}