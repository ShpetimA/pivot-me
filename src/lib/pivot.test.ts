import { transactions } from "~/constants/data";
import {
  groupByColAndRow,
  buildColumnTree,
} from "~/lib/pivot";
import type { Transaction } from "~/types/transaction";

describe("groupByColAndRow", () => {
  describe("basic functionality", () => {
    it("groups data by single column dimension", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "bill",
          transaction_number: "2",
          amount: "200",
          status: "unpaid",
          year: "2024",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.rowPaths).toEqual(["2024"]);
      expect(result.colPaths).toEqual(["paid", "unpaid"]);
      expect(result.data["2024"]["paid"]).toBe(100);
      expect(result.data["2024"]["unpaid"]).toBe(200);
    });

    it("groups data by multiple column dimensions with pipe separator", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "bill",
          transaction_number: "2",
          amount: "200",
          status: "paid",
          year: "2024",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status", "transaction_type"],
      });

      expect(result.colPaths).toEqual(["paid|bill", "paid|invoice"]);
      expect(result.data["2024"]["paid|invoice"]).toBe(100);
      expect(result.data["2024"]["paid|bill"]).toBe(200);
    });

    it("aggregates amounts for same row+col combination", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "invoice",
          transaction_number: "2",
          amount: "150",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "invoice",
          transaction_number: "3",
          amount: "50",
          status: "paid",
          year: "2024",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.data["2024"]["paid"]).toBe(300);
    });

    it("handles multiple rows correctly", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "invoice",
          transaction_number: "2",
          amount: "200",
          status: "paid",
          year: "2023",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.rowPaths).toEqual(["2024", "2023"]);
      expect(result.data["2024"]["paid"]).toBe(100);
      expect(result.data["2023"]["paid"]).toBe(200);
    });
  });

  describe("edge cases", () => {
    it("handles empty data array", () => {
      const result = groupByColAndRow([], {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.rowPaths).toEqual([]);
      expect(result.colPaths).toEqual([]);
      expect(result.data).toEqual({});
    });

    it("handles single transaction", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100",
          status: "paid",
          year: "2024",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.rowPaths).toEqual(["2024"]);
      expect(result.colPaths).toEqual(["paid"]);
      expect(result.data["2024"]["paid"]).toBe(100);
    });

    it("handles decimal amounts correctly", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100.50",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "invoice",
          transaction_number: "2",
          amount: "50.25",
          status: "paid",
          year: "2024",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.data["2024"]["paid"]).toBeCloseTo(150.75);
    });

    it("handles negative amounts", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "bill",
          transaction_number: "1",
          amount: "-100",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "bill",
          transaction_number: "2",
          amount: "50",
          status: "paid",
          year: "2024",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.data["2024"]["paid"]).toBe(-50);
    });

    it("sorts rows in descending order", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100",
          status: "paid",
          year: "2022",
        },
        {
          transaction_type: "invoice",
          transaction_number: "2",
          amount: "100",
          status: "paid",
          year: "2025",
        },
        {
          transaction_type: "invoice",
          transaction_number: "3",
          amount: "100",
          status: "paid",
          year: "2023",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.rowPaths).toEqual(["2025", "2023", "2022"]);
    });

    it("sorts columns in ascending order", () => {
      const testData: Transaction[] = [
        {
          transaction_type: "invoice",
          transaction_number: "1",
          amount: "100",
          status: "unpaid",
          year: "2024",
        },
        {
          transaction_type: "invoice",
          transaction_number: "2",
          amount: "100",
          status: "paid",
          year: "2024",
        },
        {
          transaction_type: "invoice",
          transaction_number: "3",
          amount: "100",
          status: "partially_paid",
          year: "2024",
        },
      ];

      const result = groupByColAndRow(testData, {
        rowDimension: "year",
        columnDimensions: ["status"],
      });

      expect(result.colPaths).toEqual(["paid", "partially_paid", "unpaid"]);
    });
  });

  describe("with real transaction data", () => {
    it("correctly processes transaction constants", () => {
      const result = groupByColAndRow(transactions, {
        rowDimension: "year",
        columnDimensions: ["status", "transaction_type"],
      });

      expect(result.rowPaths.length).toBeGreaterThan(0);
      expect(result.colPaths.length).toBeGreaterThan(0);
      expect(Object.keys(result.data).length).toBeGreaterThan(0);

      // Verify structure
      result.rowPaths.forEach((row) => {
        expect(result.data[row]).toBeDefined();
        expect(typeof result.data[row]).toBe("object");
      });
    });

    it("matches snapshot for real transaction data", () => {
      const result = groupByColAndRow(transactions, {
        rowDimension: "year",
        columnDimensions: ["status", "transaction_type"],
      });

      expect(result).toMatchSnapshot();
    });
  });
});

describe("buildColumnTree", () => {
  describe("basic functionality", () => {
    it("builds single level tree", () => {
      const colPaths = ["A", "B", "C"];
      const result = buildColumnTree(colPaths);

      expect(result).toEqual([
        { label: "A", colspan: 1, level: 0, children: null },
        { label: "B", colspan: 1, level: 0, children: null },
        { label: "C", colspan: 1, level: 0, children: null },
      ]);
    });

    it("builds two level hierarchy", () => {
      const colPaths = ["A|1", "A|2", "B|1"];
      const result = buildColumnTree(colPaths);

      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("A");
      expect(result[0].colspan).toBe(2);
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children?.[0].label).toBe("1");
      expect(result[0].children?.[1].label).toBe("2");

      expect(result[1].label).toBe("B");
      expect(result[1].colspan).toBe(1);
      expect(result[1].children).toHaveLength(1);
      expect(result[1].children?.[0].label).toBe("1");
    });

    it("builds three level hierarchy", () => {
      const colPaths = ["A|X|1", "A|X|2", "A|Y|1", "B|Z|1"];
      const result = buildColumnTree(colPaths);

      expect(result).toHaveLength(2);

      expect(result[0].label).toBe("A");
      expect(result[0].colspan).toBe(3);
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children?.[0].label).toBe("X");
      expect(result[0].children?.[0].colspan).toBe(2);
      expect(result[0].children?.[0].children).toHaveLength(2);

      expect(result[1].label).toBe("B");
      expect(result[1].colspan).toBe(1);
    });

    it("calculates colspan correctly for leaves", () => {
      const colPaths = ["A|1", "A|2", "A|3", "B|1"];
      const result = buildColumnTree(colPaths);

      expect(result[0].colspan).toBe(3);
      expect(result[1].colspan).toBe(1);
    });

    it("maintains level depth correctly", () => {
      const colPaths = ["A|X|1", "A|X|2"];
      const result = buildColumnTree(colPaths);

      expect(result[0].level).toBe(0);
      expect(result[0].children?.[0].level).toBe(1);
      expect(result[0].children?.[0].children?.[0].level).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("handles empty array", () => {
      const result = buildColumnTree([]);
      expect(result).toEqual([]);
    });

    it("handles single column path", () => {
      const colPaths = ["A"];
      const result = buildColumnTree(colPaths);

      expect(result).toEqual([
        { label: "A", colspan: 1, level: 0, children: null },
      ]);
    });

    it("handles single multi-level path", () => {
      const colPaths = ["A|B|C"];
      const result = buildColumnTree(colPaths);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("A");
      expect(result[0].colspan).toBe(1);
      expect(result[0].children?.[0].label).toBe("B");
      expect(result[0].children?.[0].children?.[0].label).toBe("C");
    });

    it("preserves order of columns", () => {
      const colPaths = ["Z", "A", "M"];
      const result = buildColumnTree(colPaths);

      expect(result[0].label).toBe("Z");
      expect(result[1].label).toBe("A");
      expect(result[2].label).toBe("M");
    });

    it("handles duplicate sibling labels correctly", () => {
      const colPaths = ["A|1", "A|1", "A|2"];
      const result = buildColumnTree(colPaths);

      expect(result[0].label).toBe("A");
      expect(result[0].colspan).toBe(3);
      expect(result[0].children).toHaveLength(2);
    });
  });
});
