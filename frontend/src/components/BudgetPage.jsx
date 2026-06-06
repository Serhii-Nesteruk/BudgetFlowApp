import BudgetPlanner from "./BudgetPlanner";

export default function BudgetPage({ expenses, rates, baseCurrency }) {
  return <BudgetPlanner expenses={expenses} rates={rates} baseCurrency={baseCurrency} />;
}
