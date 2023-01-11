import Layout from "../components/layout/Layout";
import { Glasses } from "../components/optician/Glasses";

export default () => {
  return (
    <Layout>
      <div>TODO: optician's store</div>
      <h1 className="text-6xl">Hansens Brilleforetning</h1>
      <Glasses price={2500} />
    </Layout>
  );
};
