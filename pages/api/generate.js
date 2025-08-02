export default async function handler(req, res) {
  const { skills, budget, time, target } = req.body;
  res.status(200).json({
    result: `Based on your skills (${skills}), budget (${budget}), and time (${time}), we recommend daily tasks to meet your $${target} goal.`,
  });
}
