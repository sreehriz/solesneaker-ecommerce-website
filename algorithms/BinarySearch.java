package algorithms;

public class BinarySearch {
    /**
     * Performs binary search on a sorted array of strings.
     * @param arr Sorted array of strings (case-insensitive search)
     * @param target Target string to search for
     * @return index of target if found, else -1
     */
    public static int search(String[] arr, String target) {
        if (arr == null || target == null) return -1;
        int low = 0;
        int high = arr.length - 1;
        String lowerTarget = target.toLowerCase().trim();

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == null) {
                high = mid - 1;
                continue;
            }
            String midVal = arr[mid].toLowerCase().trim();
            int cmp = midVal.compareTo(lowerTarget);

            if (cmp == 0) {
                return mid; // found
            } else if (cmp < 0) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1; // not found
    }
}
