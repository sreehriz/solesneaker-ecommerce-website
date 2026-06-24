package algorithms;

import java.util.*;

public class algorithm {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("{\"error\":\"No algorithm specified. Usage: java algorithm <alg_name> [args]\"}");
            return;
        }

        String action = args[0].toLowerCase();
        try {
            switch (action) {
                case "binary_search":
                    handleBinarySearch(args);
                    break;
                case "merge_sort":
                    handleMergeSort(args);
                    break;
                case "dijkstra":
                    handleDijkstra(args);
                    break;
                case "huffman":
                    handleHuffman(args);
                    break;
                case "knapsack":
                    handleKnapsack(args);
                    break;
                case "subset_sum":
                    handleSubsetSum(args);
                    break;
                case "nqueens":
                    handleNQueens(args);
                    break;
                case "obst":
                    handleOBST(args);
                    break;
                case "floyd":
                    handleFloyd(args);
                    break;
                case "warshall":
                    handleWarshall(args);
                    break;
                case "hamiltonian":
                    handleHamiltonian(args);
                    break;
                case "test":
                    System.out.println("{\"status\":\"Java Algorithm Controller is working!\"}");
                    break;
                default:
                    System.out.println("{\"error\":\"Unknown algorithm: " + action + "\"}");
            }
        } catch (Exception e) {
            StringBuilder sb = new StringBuilder();
            sb.append("{\"error\":\"Execution failed: ");
            String msg = e.getMessage() != null ? e.getMessage().replace("\"", "\\\"") : "NullPointerException";
            sb.append(msg);
            sb.append("\"}");
            System.out.println(sb.toString());
        }
    }

    // ─── Binary Search — Product search ──────────────────────────────────────
    private static void handleBinarySearch(String[] args) {
        if (args.length < 3) {
            System.out.println("{\"error\":\"Binary Search requires: <sorted_comma_list> <target>\"}");
            return;
        }
        String[] arr = args[1].split(",");
        String target = args[2];
        int index = BinarySearch.search(arr, target);
        System.out.println("{\"index\":" + index + "}");
    }

    // ─── Merge Sort — Product sorting (price, rating) ─────────────────────────
    private static void handleMergeSort(String[] args) {
        if (args.length < 3) {
            System.out.println("{\"error\":\"Merge Sort requires: <key_value_pairs> <ascending_boolean>\"}");
            return;
        }
        String[] pairs = args[1].split(",");
        boolean ascending = Boolean.parseBoolean(args[2]);

        MergeSort.SortItem[] arr = new MergeSort.SortItem[pairs.length];
        for (int i = 0; i < pairs.length; i++) {
            String[] parts = pairs[i].split(":");
            String key = parts[0];
            double val = Double.parseDouble(parts[1]);
            arr[i] = new MergeSort.SortItem(key, val);
        }

        MergeSort.sort(arr, ascending);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"sorted\":[");
        for (int i = 0; i < arr.length; i++) {
            sb.append("{\"key\":\"").append(arr[i].key.replace("\"", "\\\"")).append("\",\"value\":").append(arr[i].value).append("}");
            if (i < arr.length - 1) sb.append(",");
        }
        sb.append("]}");
        System.out.println(sb.toString());
    }

    // ─── Dijkstra — Delivery route optimization ───────────────────────────────
    private static void handleDijkstra(String[] args) {
        if (args.length < 4) {
            System.out.println("{\"error\":\"Dijkstra requires: <edges_list> <start> <end>\"}");
            return;
        }
        String[] edgeStrings = args[1].split(",");
        String start = args[2];
        String end = args[3];

        Map<String, List<Dijkstra.Edge>> graph = new HashMap<>();
        for (String edgeStr : edgeStrings) {
            String[] parts = edgeStr.split(":");
            String nodesStr = parts[0];
            double weight = Double.parseDouble(parts[1]);

            String[] nodes = nodesStr.split("-");
            String u = nodes[0];
            String v = nodes[1];

            graph.putIfAbsent(u, new ArrayList<>());
            graph.get(u).add(new Dijkstra.Edge(v, weight));

            graph.putIfAbsent(v, new ArrayList<>());
            graph.get(v).add(new Dijkstra.Edge(u, weight));
        }

        Dijkstra.PathResult result = Dijkstra.findShortestPath(graph, start, end);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"path\":[");
        for (int i = 0; i < result.path.size(); i++) {
            sb.append("\"").append(result.path.get(i).replace("\"", "\\\"")).append("\"");
            if (i < result.path.size() - 1) sb.append(",");
        }
        sb.append("],\"totalDistance\":").append(result.totalDistance).append("}");
        System.out.println(sb.toString());
    }

    // ─── Huffman — Invoice/receipt compression ────────────────────────────────
    private static void handleHuffman(String[] args) {
        if (args.length < 2) {
            System.out.println("{\"error\":\"Huffman requires: <text_to_compress>\"}");
            return;
        }
        String text = args[1];
        Huffman.HuffmanResult result = Huffman.compress(text);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"encodedText\":\"").append(result.encodedText).append("\",");
        sb.append("\"codeMap\":{");
        int count = 0;
        for (Map.Entry<String, String> entry : result.codeMap.entrySet()) {
            String keyEscaped = entry.getKey().replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
            sb.append("\"").append(keyEscaped).append("\":\"").append(entry.getValue()).append("\"");
            if (++count < result.codeMap.size()) sb.append(",");
        }
        sb.append("},\"originalSizeBits\":").append(result.originalSizeBits);
        sb.append(",\"compressedSizeBits\":").append(result.compressedSizeBits);
        sb.append(",\"compressionRatio\":").append(result.compressionRatio).append("}");
        System.out.println(sb.toString());
    }

    // ─── Knapsack — Budget-based cart recommendations ─────────────────────────
    private static void handleKnapsack(String[] args) {
        if (args.length < 3) {
            System.out.println("{\"error\":\"Knapsack requires: <budget> <items_list>\"}");
            return;
        }
        int budget = Integer.parseInt(args[1]);
        String[] itemStrings = args[2].split(",");
        List<Knapsack.KnapsackItem> items = new ArrayList<>();
        for (String itemStr : itemStrings) {
            String[] parts = itemStr.split(":");
            String name = parts[0];
            int price = Integer.parseInt(parts[1]);
            double rating = Double.parseDouble(parts[2]);
            items.add(new Knapsack.KnapsackItem(name, price, rating));
        }

        Knapsack.KnapsackResult result = Knapsack.optimize(items, budget);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"selectedItems\":[");
        for (int i = 0; i < result.selectedItems.size(); i++) {
            sb.append("\"").append(result.selectedItems.get(i).replace("\"", "\\\"")).append("\"");
            if (i < result.selectedItems.size() - 1) sb.append(",");
        }
        sb.append("],\"totalWeight\":").append(result.totalWeight);
        sb.append(",\"totalValue\":").append(result.totalValue).append("}");
        System.out.println(sb.toString());
    }

    // ─── Subset Sum — Coupon bundle matching ─────────────────────────────────
    private static void handleSubsetSum(String[] args) {
        if (args.length < 4) {
            System.out.println("{\"error\":\"Subset Sum requires: <weights_comma_separated> <target> <max_solutions>\"}");
            return;
        }
        String[] weightStrs = args[1].split(",");
        int[] weights = new int[weightStrs.length];
        for (int i = 0; i < weightStrs.length; i++) weights[i] = Integer.parseInt(weightStrs[i]);

        int target = Integer.parseInt(args[2]);
        int maxSolutions = Integer.parseInt(args[3]);

        List<List<Integer>> subsets = SubsetSum.findSubsets(weights, target, maxSolutions);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"subsets\":[");
        for (int i = 0; i < subsets.size(); i++) {
            List<Integer> subset = subsets.get(i);
            sb.append("[");
            for (int j = 0; j < subset.size(); j++) {
                sb.append(subset.get(j));
                if (j < subset.size() - 1) sb.append(",");
            }
            sb.append("]");
            if (i < subsets.size() - 1) sb.append(",");
        }
        sb.append("]}");
        System.out.println(sb.toString());
    }

    // ─── N-Queens — Stand placement optimization ──────────────────────────────
    private static void handleNQueens(String[] args) {
        if (args.length < 2) {
            System.out.println("{\"error\":\"N-Queens requires: <board_size>\"}");
            return;
        }
        int n = Integer.parseInt(args[1]);
        List<int[]> solutions = NQueens.solve(n);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"solutions\":[");
        for (int i = 0; i < solutions.size(); i++) {
            int[] board = solutions.get(i);
            sb.append("[");
            for (int j = 0; j < board.length; j++) {
                sb.append(board[j]);
                if (j < board.length - 1) sb.append(",");
            }
            sb.append("]");
            if (i < solutions.size() - 1) sb.append(",");
        }
        sb.append("]}");
        System.out.println(sb.toString());
    }

    // ─── OBST — Optimal BST keyword frequency optimizer ───────────────────────
    private static void handleOBST(String[] args) {
        if (args.length < 4) {
            System.out.println("{\"error\":\"OBST requires: <keys> <p_probs> <q_probs>\"}");
            return;
        }
        String[] keys = args[1].split(",");
        String[] pStrs = args[2].split(",");
        String[] qStrs = args[3].split(",");

        double[] p = new double[pStrs.length];
        double[] q = new double[qStrs.length];

        for (int i = 0; i < pStrs.length; i++) p[i] = Double.parseDouble(pStrs[i]);
        for (int i = 0; i < qStrs.length; i++) q[i] = Double.parseDouble(qStrs[i]);

        OBST.OBSTResult result = OBST.compute(keys, p, q);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"minCost\":").append(result.minCost).append(",");
        sb.append("\"keys\":[");
        for (int i = 0; i < keys.length; i++) {
            sb.append("\"").append(keys[i].replace("\"", "\\\"")).append("\"");
            if (i < keys.length - 1) sb.append(",");
        }
        sb.append("],\"pProbs\":[");
        for (int i = 0; i < p.length; i++) {
            sb.append(p[i]);
            if (i < p.length - 1) sb.append(",");
        }
        sb.append("],\"structure\":[");
        for (int i = 0; i < result.structure.size(); i++) {
            sb.append("\"").append(result.structure.get(i).replace("\"", "\\\"")).append("\"");
            if (i < result.structure.size() - 1) sb.append(",");
        }
        sb.append("]}");
        System.out.println(sb.toString());
    }

    // ─── Floyd — All-pairs shortest route paths ───────────────────────────────
    private static void handleFloyd(String[] args) {
        if (args.length < 2) {
            System.out.println("{\"error\":\"Floyd requires: <adjacency_matrix_rows_semicolon_separated>\"}");
            return;
        }
        String[] rows = args[1].split(";");
        int n = rows.length;
        double[][] distMatrix = new double[n][n];

        for (int i = 0; i < n; i++) {
            String[] cells = rows[i].split(",");
            for (int j = 0; j < n; j++) {
                distMatrix[i][j] = Double.parseDouble(cells[j]);
            }
        }

        double[][] shortest = Floyd.computeAllPairsShortestPath(distMatrix);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"shortestDistances\":[");
        for (int i = 0; i < n; i++) {
            sb.append("[");
            for (int j = 0; j < n; j++) {
                if (shortest[i][j] >= 99999.0) {
                    sb.append("\"inf\"");
                } else {
                    sb.append(shortest[i][j]);
                }
                if (j < n - 1) sb.append(",");
            }
            sb.append("]");
            if (i < n - 1) sb.append(",");
        }
        sb.append("]}");
        System.out.println(sb.toString());
    }

    // ─── Warshall — Transitive closures categories recommendations ────────────
    private static void handleWarshall(String[] args) {
        if (args.length < 2) {
            System.out.println("{\"error\":\"Warshall requires: <adjacency_matrix_rows_semicolon_separated>\"}");
            return;
        }
        String[] rows = args[1].split(";");
        int n = rows.length;
        int[][] adjMatrix = new int[n][n];

        for (int i = 0; i < n; i++) {
            String[] cells = rows[i].split(",");
            for (int j = 0; j < n; j++) {
                adjMatrix[i][j] = Integer.parseInt(cells[j]);
            }
        }

        int[][] tc = Warshall.computeTransitiveClosure(adjMatrix);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"transitiveClosure\":[");
        for (int i = 0; i < n; i++) {
            sb.append("[");
            for (int j = 0; j < n; j++) {
                sb.append(tc[i][j]);
                if (j < n - 1) sb.append(",");
            }
            sb.append("]");
            if (i < n - 1) sb.append(",");
        }
        sb.append("]}");
        System.out.println(sb.toString());
    }

    // ─── Hamiltonian — Delivery TSP route checking ────────────────────────────
    private static void handleHamiltonian(String[] args) {
        if (args.length < 2) {
            System.out.println("{\"error\":\"Hamiltonian requires: <adjacency_matrix_rows_semicolon_separated>\"}");
            return;
        }
        String[] rows = args[1].split(";");
        int n = rows.length;
        int[][] adjMatrix = new int[n][n];

        for (int i = 0; i < n; i++) {
            String[] cells = rows[i].split(",");
            for (int j = 0; j < n; j++) {
                adjMatrix[i][j] = Integer.parseInt(cells[j]);
            }
        }

        List<Integer> path = Hamiltonian.findCycle(adjMatrix);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"path\":[");
        for (int i = 0; i < path.size(); i++) {
            sb.append(path.get(i));
            if (i < path.size() - 1) sb.append(",");
        }
        sb.append("]}");
        System.out.println(sb.toString());
    }
}
