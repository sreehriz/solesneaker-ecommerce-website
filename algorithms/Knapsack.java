package algorithms;

import java.util.*;

public class Knapsack {
    public static class KnapsackItem {
        public String name;
        public int weight; // represents price (rounded to integer)
        public double value; // represents rating or utility score

        public KnapsackItem(String name, int weight, double value) {
            this.name = name;
            this.weight = weight;
            this.value = value;
        }
    }

    public static class KnapsackResult {
        public List<String> selectedItems;
        public int totalWeight;
        public double totalValue;

        public KnapsackResult(List<String> selectedItems, int totalWeight, double totalValue) {
            this.selectedItems = selectedItems;
            this.totalWeight = totalWeight;
            this.totalValue = totalValue;
        }
    }

    /**
     * Solves 0/1 Knapsack using Dynamic Programming.
     * @param items List of candidate items
     * @param budget Max capacity (budget constraint)
     */
    public static KnapsackResult optimize(List<KnapsackItem> items, int budget) {
        if (items == null || items.isEmpty() || budget <= 0) {
            return new KnapsackResult(new ArrayList<>(), 0, 0.0);
        }

        int n = items.size();
        // dp[i][w] will store the maximum value that can be attained with weight limit w using first i items
        // To handle fractional ratings accurately, we store doubles in dp array
        double[][] dp = new double[n + 1][budget + 1];

        // Build table dp[][] in bottom up manner
        for (int i = 1; i <= n; i++) {
            KnapsackItem item = items.get(i - 1);
            for (int w = 0; w <= budget; w++) {
                if (item.weight <= w) {
                    dp[i][w] = Math.max(item.value + dp[i - 1][w - item.weight], dp[i - 1][w]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        // Traceback to find selected items
        List<String> selected = new ArrayList<>();
        int w = budget;
        int totalWeight = 0;
        double totalValue = dp[n][budget];

        for (int i = n; i > 0 && w > 0; i--) {
            // If the value is different from the row above, the item was included
            if (dp[i][w] != dp[i - 1][w]) {
                KnapsackItem item = items.get(i - 1);
                selected.add(item.name);
                w -= item.weight;
                totalWeight += item.weight;
            }
        }

        // Reverse to maintain original order
        Collections.reverse(selected);

        return new KnapsackResult(selected, totalWeight, totalValue);
    }
}
