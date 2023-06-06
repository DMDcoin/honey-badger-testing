-- This script was generated by the ERD tool in pgAdmin 4.
-- Please log an issue at https://redmine.postgresql.org/projects/pgadmin4/issues/new if you find any bugs, including reproduction steps.
BEGIN;


CREATE TABLE IF NOT EXISTS public.headers
(
    block_number integer NOT NULL,
    block_hash character(64) COLLATE pg_catalog."default" NOT NULL,
    extra_data character varying(64) COLLATE pg_catalog."default" NOT NULL,
    block_time timestamp without time zone NOT NULL,
    block_duration integer NOT NULL,
    transaction_count integer NOT NULL,
    txs_per_sec double precision NOT NULL,
    posdao_hbbft_epoch integer,
    reinsert_pot numeric,
    delta_pot numeric,
    reward_contract_total numeric,
    unclaimed_rewards numeric,
    CONSTRAINT headers_pkey PRIMARY KEY (block_number)
);

CREATE TABLE IF NOT EXISTS public.posdao_epoch
(
    id integer NOT NULL,
    block_start integer NOT NULL,
    block_end integer,
    CONSTRAINT "PK_id" PRIMARY KEY (id),
    CONSTRAINT uc_block_start UNIQUE (block_start),
    CONSTRAINT uc_block_end UNIQUE (block_end)
);

CREATE TABLE IF NOT EXISTS public.node
(
    pool_address bit(160) NOT NULL,
    mining_address bit(160) NOT NULL,
    mining_public_key bit(512) NOT NULL,
    diamond_name character varying(512),
    ens_name character varying(512),
    added_block integer,
    PRIMARY KEY (pool_address)
);

CREATE TABLE IF NOT EXISTS public.posdao_epoch_node
(
    id_node bit(160) NOT NULL,
    id_posdao_epoch integer NOT NULL,
    owner_reward numeric(36, 18),
    is_claimed boolean DEFAULT FALSE,
    PRIMARY KEY (id_posdao_epoch, id_node)
);

CREATE TABLE IF NOT EXISTS public.delegate_staker
(
    id bit(160) NOT NULL,
    CONSTRAINT "PK_Delegate_Staker" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.delegate_reward
(
    id_node bit(160) NOT NULL,
    id_posdao_epoch integer NOT NULL,
    id_delegator bit(160) NOT NULL,
    is_claimed boolean DEFAULT FALSE,
    CONSTRAINT "PK" PRIMARY KEY (id_node, id_delegator, id_posdao_epoch),
    CONSTRAINT "U_delegate_reward" UNIQUE (id_node, id_posdao_epoch, id_delegator)
);

COMMENT ON TABLE public.delegate_reward
    IS 'rewards from delegate staking';

CREATE TABLE IF NOT EXISTS public."OrderedWithdrawal"
(
    id serial NOT NULL,
    amount numeric(36, 18) NOT NULL,
    "blockNumber" integer,
    "stakingEpoch" integer,
    "fromPoolStakingAddress" bit(160),
    staker bit(160),
    "claimedOnBlock" integer,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."StakeHistory"
(
    from_block integer,
    to_block integer,
    stake_amount numeric(36, 18) NOT NULL,
    node bit(160)
);

CREATE TABLE IF NOT EXISTS public."PendingValidatorState"
(
    id integer,
    name character varying(32),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."PendingValidatorStateEvent"
(
    state integer,
    on_enter_block_number integer,
    on_exit_block_number integer
);

ALTER TABLE IF EXISTS public.posdao_epoch
    ADD CONSTRAINT fk_block_start FOREIGN KEY (block_start)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_block_start
    ON public.posdao_epoch(block_start);


ALTER TABLE IF EXISTS public.posdao_epoch
    ADD CONSTRAINT fk_block_end FOREIGN KEY (block_end)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_block_end
    ON public.posdao_epoch(block_end);


ALTER TABLE IF EXISTS public.node
    ADD CONSTRAINT fk_added_block FOREIGN KEY (added_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_added_block
    ON public.node(added_block);


ALTER TABLE IF EXISTS public.posdao_epoch_node
    ADD FOREIGN KEY (id_node)
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.posdao_epoch_node
    ADD FOREIGN KEY (id_posdao_epoch)
    REFERENCES public.posdao_epoch (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.delegate_reward
    ADD CONSTRAINT fk_posdao_epoch FOREIGN KEY (id_posdao_epoch)
    REFERENCES public.posdao_epoch (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS fki_fk_posdao_epoch
    ON public.delegate_reward(id_posdao_epoch);


ALTER TABLE IF EXISTS public.delegate_reward
    ADD CONSTRAINT fk_delegate_staker FOREIGN KEY (id_delegator)
    REFERENCES public.delegate_staker (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."OrderedWithdrawal"
    ADD CONSTRAINT "FK_Pool_Address" FOREIGN KEY ("fromPoolStakingAddress")
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."OrderedWithdrawal"
    ADD CONSTRAINT "FK_Staking_epoch" FOREIGN KEY ("stakingEpoch")
    REFERENCES public.posdao_epoch (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."OrderedWithdrawal"
    ADD CONSTRAINT "FK_Placed_Order" FOREIGN KEY ("claimedOnBlock")
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."OrderedWithdrawal"
    ADD CONSTRAINT "FK_Claimed_Block" FOREIGN KEY ("claimedOnBlock")
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."StakeHistory"
    ADD CONSTRAINT "FK_From_Block" FOREIGN KEY (from_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."StakeHistory"
    ADD CONSTRAINT "FK_To_Block" FOREIGN KEY (to_block)
    REFERENCES public.headers (block_number) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."StakeHistory"
    ADD CONSTRAINT "FK_Node" FOREIGN KEY (node)
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;