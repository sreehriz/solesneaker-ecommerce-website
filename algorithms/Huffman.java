package algorithms;

import java.util.*;

public class Huffman {
    public static class HuffmanNode {
        public char data;
        public int frequency;
        public HuffmanNode left, right;

        public HuffmanNode(char data, int frequency) {
            this.data = data;
            this.frequency = frequency;
            this.left = null;
            this.right = null;
        }

        public HuffmanNode(int frequency, HuffmanNode left, HuffmanNode right) {
            this.data = '\0';
            this.frequency = frequency;
            this.left = left;
            this.right = right;
        }

        public boolean isLeaf() {
            return left == null && right == null;
        }
    }

    public static class HuffmanResult {
        public String encodedText;
        public Map<String, String> codeMap; // Char to binary code
        public int originalSizeBits;
        public int compressedSizeBits;
        public double compressionRatio;

        public HuffmanResult(String encodedText, Map<String, String> codeMap, int originalSizeBits, int compressedSizeBits) {
            this.encodedText = encodedText;
            this.codeMap = codeMap;
            this.originalSizeBits = originalSizeBits;
            this.compressedSizeBits = compressedSizeBits;
            this.compressionRatio = (double) originalSizeBits / (compressedSizeBits == 0 ? 1 : compressedSizeBits);
        }
    }

    public static HuffmanResult compress(String text) {
        if (text == null || text.isEmpty()) {
            return new HuffmanResult("", new HashMap<>(), 0, 0);
        }

        // Count character frequencies
        Map<Character, Integer> freqMap = new HashMap<>();
        for (char c : text.toCharArray()) {
            freqMap.put(c, freqMap.getOrDefault(c, 0) + 1);
        }

        // Build priority queue
        PriorityQueue<HuffmanNode> pq = new PriorityQueue<>(Comparator.comparingInt(node -> node.frequency));
        for (Map.Entry<Character, Integer> entry : freqMap.entrySet()) {
            pq.add(new HuffmanNode(entry.getKey(), entry.getValue()));
        }

        // Handle single character edge case
        if (pq.size() == 1) {
            HuffmanNode single = pq.poll();
            HuffmanNode root = new HuffmanNode(single.frequency, single, null);
            pq.add(root);
        }

        // Build the Huffman Tree
        while (pq.size() > 1) {
            HuffmanNode left = pq.poll();
            HuffmanNode right = pq.poll();
            HuffmanNode parent = new HuffmanNode(left.frequency + right.frequency, left, right);
            pq.add(parent);
        }

        HuffmanNode root = pq.poll();

        // Generate codes
        Map<String, String> codeMap = new HashMap<>();
        generateCodes(root, "", codeMap);

        // Encode the text
        StringBuilder encoded = new StringBuilder();
        for (char c : text.toCharArray()) {
            encoded.append(codeMap.get(String.valueOf(c)));
        }

        int originalSize = text.length() * 8; // 8 bits per character
        int compressedSize = encoded.length();

        return new HuffmanResult(encoded.toString(), codeMap, originalSize, compressedSize);
    }

    private static void generateCodes(HuffmanNode node, String code, Map<String, String> codeMap) {
        if (node == null) return;

        if (node.isLeaf()) {
            codeMap.put(String.valueOf(node.data), code);
            return;
        }

        generateCodes(node.left, code + "0", codeMap);
        generateCodes(node.right, code + "1", codeMap);
    }
}
