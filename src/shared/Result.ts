export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

/** Transform the value of an Ok result, passing Err through unchanged. */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
	return result.ok ? ok(fn(result.value)) : result;
}

/** Transform the error of an Err result, passing Ok through unchanged. */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
	return result.ok ? result : err(fn(result.error));
}

/** Chain a Result-returning function, flattening the result. */
export function flatMap<T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>
): Result<U, E> {
	return result.ok ? fn(result.value) : result;
}

/** Get the value if Ok, or the fallback if Err. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
	return result.ok ? result.value : fallback;
}

/** Get the value if Ok, or throw the error if Err. */
export function unwrap<T, E>(result: Result<T, E>): T {
	if (result.ok) return result.value;
	throw result.error;
}

/** Wrap an async function, catching any thrown error into an Err. */
export async function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
	try {
		return ok(await fn());
	} catch (e) {
		return err(e instanceof Error ? e : new Error(String(e)));
	}
}
