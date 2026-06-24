package algorithms;

public class MergeSort {
    public static class SortItem {
        public String key;
        public double value;

        public SortItem(String key, double value) {
            this.key = key;
            this.value = value;
        }
    }

    public static void sort(SortItem[] arr, boolean ascending) {
        if (arr == null || arr.length <= 1) {
            return;
        }
        mergeSort(arr, 0, arr.length - 1, ascending);
    }

    private static void mergeSort(SortItem[] arr, int left, int right, boolean ascending) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(arr, left, mid, ascending);
            mergeSort(arr, mid + 1, right, ascending);
            merge(arr, left, mid, right, ascending);
        }
    }

    private static void merge(SortItem[] arr, int left, int mid, int right, boolean ascending) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        SortItem[] L = new SortItem[n1];
        SortItem[] R = new SortItem[n2];

        for (int i = 0; i < n1; ++i) {
            L[i] = arr[left + i];
        }
        for (int j = 0; j < n2; ++j) {
            R[j] = arr[mid + 1 + j];
        }

        int i = 0, j = 0;
        int k = left;

        while (i < n1 && j < n2) {
            boolean compareCondition = ascending ? (L[i].value <= R[j].value) : (L[i].value >= R[j].value);
            if (compareCondition) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            k++;
        }

        while (i < n1) {
            arr[k] = L[i];
            i++;
            k++;
        }

        while (j < n2) {
            arr[k] = R[j];
            j++;
            k++;
        }
    }
}
