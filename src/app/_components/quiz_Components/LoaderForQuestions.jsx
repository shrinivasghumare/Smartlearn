import { memo } from "react";
const LoaderForQuestions = () => {
  return (
    <div className="mb-4">
      <h5 className="card-title">
        <span className="placeholder-glow">
          <span className="placeholder col-6" />
        </span>
      </h5>
      <p className="text-muted">
        {["info", "primary", "secondary", "success", "light"].map(
          (color, idx) => (
            <span
              className={`badge rounded-pill text-bg-${color} placeholder col-1 mx-1`}
              key={idx}
            >
              {" "}
            </span>
          )
        )}
      </p>
      <ul className="list-unstyled">
        {[...Array(4)].map((_, i) => (
          <span className="placeholder-glow d-flex flex-col my-1" key={i}>
            <input className="form-check-input" type="radio" disabled />
            <span
              className="placeholder col-8 rounded-1"
              style={{ height: "10px" }}
            />
          </span>
        ))}
      </ul>
      <div className="d-flex justify-content-between">
        <button className="btn btn-dark disabled placeholder col-2" />
        <button className="btn btn-dark disabled placeholder col-2" />
      </div>
    </div>
  );
};
export default memo(LoaderForQuestions);
