/*
    Written with ❤
    github.com/Examplio
*/

function sortArr(arr: number[]): number[] {
    const n = arr.length;

    // Base case: a single-element array is already sorted. T(1) = O(1).
    if (n <= 1)
        return arr;

    // Instead of slicing in recursion (which allocates + copies every level),
    // convert recursion to an inner helper that works on index ranges.
    // This eliminates O(n) copying, reduces GC pressure, and increases cache locality.
    function sortRange(start: number, end: number): number[] {
        const len: number = end - start;

        // Base case again for subranges
        if (len <= 1)
            return [arr[start]];

        // Recursive division into two subproblems of size n/2.
        // T(n) = 2T(n/2) + M(n) where M(n) is merging.
        const mid: number = start + (len >>> 1);

        const left: number[] = sortRange(start, mid);
        const right: number[] = sortRange(mid, end);

        // If max(left) <= min(right), no merge needed => O(1)
        if (left[left.length - 1] <= right[0]) {
            const res = new Array(left.length + right.length);
            let k = 0;

            for (let i = 0; i < left.length; i++) res[k++] = left[i];
            for (let j = 0; j < right.length; j++) res[k++] = right[j];
            return res;
        }

        // Small overlap optimization (Insertion-like merge)
        // Expected cost becomes O(k).
        if (Math.abs(left[left.length - 1] - right[0]) < 3) {
            const result: number[] = left.slice();

            // Removed splice() because it triggers V8 slow-path:
            // - forces array hole checks
            // - shifts entire tail in O(n)
            // Replaced with manual shift-insertion which is faster & predictable.
            for (let x = 0; x < right.length; x++) {
                const value: number = right[x];

                let i: number = result.length - 1;
                while (i >= 0 && result[i] > value) i--;

                const insertIndex: number = i + 1;
                result.push(value);

                for (let t = result.length - 1; t > insertIndex; t--) {
                    result[t] = result[t - 1];
                }
                result[insertIndex] = value;
            }

            return result;
        }

        // Merge now uses a preallocated local buffer for this call only.
        // This is more cache-friendly than multiple new arrays during merge
        // and avoids spread operators / splice / slice overhead.
        const totalLen: number = left.length + right.length;
        const buffer: number[] = new Array(totalLen);

        let i = 0, j = 0, k = 0;

        while (i < left.length && j < right.length) {
            const lv: number = left[i];
            const rv: number = right[j];

            if (lv <= rv) {
                buffer[k++] = lv;
                i++;
            } else {
                buffer[k++] = rv;
                j++;
            }
        }

        while (i < left.length) buffer[k++] = left[i++];
        while (j < right.length) buffer[k++] = right[j++];

        return buffer;
    }

    return sortRange(0, n);
}

function generateArray(n: number): number[] {
    return Array.from({length: n}, () => Math.floor(Math.random() * n));
}

console.log(sortArr(generateArray(1_000_000)));