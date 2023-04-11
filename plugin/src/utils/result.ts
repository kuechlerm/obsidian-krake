export type Result<T> = [Error, null] | [null, T];

export async function async_wrapper<T>(
    promise: Promise<T>
): Promise<Result<T>> {
    try {
        const result = await promise;
        return [null, result];
    } catch (error) {
        return [error as Error, null];
    }
}
