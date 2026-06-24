package algorithms;

import java.util.*;

public class OBST {
    public static class OBSTResult {
        public double minCost;
        public int[][] root;
        public List<String> structure; // Represent the tree structure for visualization

        public OBSTResult(double minCost, int[][] root, List<String> structure) {
            this.minCost = minCost;
            this.root = root;
            this.structure = structure;
        }
    }

    /**
     * Computes the Optimal Binary Search Tree cost and root matrix.
     * @param keys Sorted list of search keys (length n)
     * @param p Probabilities of successful search for keys (length n)
     * @param q Probabilities of unsuccessful search (dummy keys) (length n + 1)
     */
    public static OBSTResult compute(String[] keys, double[] p, double[] q) {
        int n = keys.length;
        // e[i][j] will store the optimal search cost of a sub-tree containing keys from i to j
        double[][] e = new double[n + 2][n + 2];
        // w[i][j] will store sum of probabilities of keys from i to j
        double[][] w = new double[n + 2][n + 2];
        // root[i][j] will store index of root of subtree containing keys from i to j
        int[][] root = new int[n + 2][n + 2];

        // Initialize base cases (subtrees with no keys, i.e., just dummy keys)
        for (int i = 1; i <= n + 1; i++) {
            e[i][i - 1] = q[i - 1];
            w[i][i - 1] = q[i - 1];
        }

        // Subtree lengths l from 1 to n
        for (int l = 1; l <= n; l++) {
            for (int i = 1; i <= n - l + 1; i++) {
                int j = i + l - 1;
                e[i][j] = Double.MAX_VALUE;
                w[i][j] = w[i][j - 1] + p[j - 1] + q[j];

                for (int r = i; r <= j; r++) {
                    double t = e[i][r - 1] + e[r + 1][j] + w[i][j];
                    if (t < e[i][j]) {
                        e[i][j] = t;
                        root[i][j] = r;
                    }
                }
            }
        }

        // Generate tree structure for frontend representation
        List<String> structure = new ArrayList<>();
        buildTreeStructure(root, keys, 1, n, -1, "Root", structure);

        return new OBSTResult(e[1][n], root, structure);
    }

    private static void buildTreeStructure(int[][] root, String[] keys, int i, int j, int parentIdx, String relation, List<String> structure) {
        if (i > j) return;
        int r = root[i][j];
        if (r == 0) return; // safety boundary

        String nodeName = keys[r - 1];
        structure.add(nodeName + " (Parent: " + (parentIdx == -1 ? "None" : keys[parentIdx - 1]) + ", Side: " + relation + ")");

        buildTreeStructure(root, keys, i, r - 1, r, "Left", structure);
        buildTreeStructure(root, keys, r + 1, j, r, "Right", structure);
    }
}
