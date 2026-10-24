import React from "react";
import Layout from "@theme/Layout";
import ControlPlayground from "../components/ControlPlayground";
export default function PlaygroundPage() {
  return (
    <Layout
      title="מעבדת בקרה"
      description="מעבדה אינטראקטיבית ללימוד שיטות בקרה ובקשות מנוע ב־FRC"
    >
      <ControlPlayground />
    </Layout>
  );
}
