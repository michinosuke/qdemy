import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { FC, useEffect, useState } from "react";

import { Doughnut } from "react-chartjs-2";

// export const data = {
//   onLoad: () => console.log("loaded"),
//   labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//   datasets: [
//     {
//       label: "# of Votes",
//       data: [12, 19, 3, 5, 2, 3],
//       backgroundColor: [
//         "rgba(255, 99, 132, 0.2)",
//         "rgba(54, 162, 235, 0.2)",
//         "rgba(255, 206, 86, 0.2)",
//         "rgba(75, 192, 192, 0.2)",
//         "rgba(153, 102, 255, 0.2)",
//         "rgba(255, 159, 64, 0.2)",
//       ],
//       borderColor: [
//         "rgba(255, 99, 132, 1)",
//         "rgba(54, 162, 235, 1)",
//         "rgba(255, 206, 86, 1)",
//         "rgba(75, 192, 192, 1)",
//         "rgba(153, 102, 255, 1)",
//         "rgba(255, 159, 64, 1)",
//       ],
//       borderWidth: 1,
//     },
//   ],
//   options: { responsive: false },
// };

type Data = {
  label: string | null;
  count: number;
}[];

type Props = {
  data: Data;
};

export const DoughnutChart: FC<Props> = ({ data }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  // const [data, setData] = useState<
  //   { label: string | null; percent: number }[] | null
  // >(null);

  useEffect(() => {
    ChartJS.register(ArcElement, Tooltip, Legend);
    setIsRegistered(true);

    // const search = new URLSearchParams(window.location.search);
    // const dataStr = search.get("data");
    // if (!dataStr) return;
    // const data: { label: string | null; percent: number }[] | null = (() => {
    //   try {
    //     return JSON.parse(dataStr);
    //   } catch (e) {
    //     console.log(e);
    //     return null;
    //   }
    // })();
    // if (!data) return;
    // setData(data);
  }, []);

  if (!isRegistered || !data) return <></>;
  return (
    <Doughnut
      data={{
        labels: data.map((d) => d.label ?? ""),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      }}
      options={{ responsive: false }}
    />
  );
};
