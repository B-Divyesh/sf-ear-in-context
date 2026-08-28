# Demo sandbox

Open `/demo` or `/?demo=1` to start the sample practice in one click. It seeds
two realistic review records and a short cadence question. The persistent
banner says **Demo — sample data, nothing is saved**.

Demo progress is stored only under `demo:ear-in-context:progress:v1`. Real
progress remains under `ear-in-context:progress:v1` and is never read or
written while demo mode is active. **Reset demo** reseeds the sample. **Start
for real** leaves the demo and discards it from the visible session.
