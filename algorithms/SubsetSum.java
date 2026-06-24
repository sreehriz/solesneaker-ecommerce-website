package algorithms;

import java.util.*;

public class SubsetSum {
    /**
     * Finds subsets of items that sum up exactly to a target sum.
     * @param weights Array of integers (representing prices in cents/dollars)
     * @param target Target sum
     * @param maxSolutions Limit number of solutions returned to avoid overhead
     * @return List of subsets summing up to target
     */
    public static List<List<Integer>> findSubsets(int[] weights, int target, int maxSolutions) {
        List<List<Integer>> solutions = new ArrayList<>();
        if (weights == null || weights.length == 0 || target <= 0) return solutions;

        // Sort weights to optimize backtracking
        Arrays.sort(weights);

        backtrack(weights, target, 0, new ArrayList<>(), solutions, maxSolutions);
        return solutions;
    }

    private static void backtrack(int[] weights, int target, int index, List<Integer> current, List<List<Integer>> solutions, int maxSolutions) {
        if (target == 0) {
            solutions.add(new ArrayList<>(current));
            return;
        }

        if (solutions.size() >= maxSolutions) {
            return;
        }

        for (int i = index; i < weights.length; i++) {
            // Pruning: if current element is greater than remaining target, stop because weights are sorted
            if (weights[i] > target) {
                break;
            }

            // Skip duplicates to avoid duplicate subset combinations
            if (i > index && weights[i] == weights[i - 1]) {
                continue;
            }

            current.add(weights[i]);
            backtrack(weights, target - weights[i], i + 1, current, solutions, maxSolutions);
            current.remove(current.size() - 1); // backtrack
        }
    }
}
